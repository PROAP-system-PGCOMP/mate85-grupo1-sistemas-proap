package br.ufba.proap.solicitationadminpanel.controller;

import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.Permission;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.solicitationadminpanel.domain.SolicitationAdmin;
import br.ufba.proap.solicitationadminpanel.domain.dto.AssistanceIdValueDTO;
import br.ufba.proap.solicitationadminpanel.domain.dto.BudgetSummaryDTO;
import br.ufba.proap.solicitationadminpanel.service.BudgetService;
import jakarta.ws.rs.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BudgetControllerTest {

    @Mock
    private BudgetService budgetService;

    @Mock
    private UserService userService;

    @InjectMocks
    private BudgetController budgetController;

    private User adminUser;
    private User regularUser;
    private SolicitationAdmin solicitationAdmin;

    @BeforeEach
    public void setup() {
        Permission adminRolePermission = new Permission();
        adminRolePermission.setId(1L);
        adminRolePermission.setKey("ADMIN_ROLE");
        adminRolePermission.setDescription("Admin permission");
        adminRolePermission.setEnabled(true);

        Permission userRolePermission = new Permission();
        userRolePermission.setId(2L);
        userRolePermission.setKey("USER_ROLE");
        userRolePermission.setDescription("User permission");
        userRolePermission.setEnabled(true);

        Perfil adminPerfil = new Perfil();
        adminPerfil.setId(2L);
        adminPerfil.setName("Admin");
        Set<Permission> adminPermissions = new HashSet<>();
        adminPermissions.add(adminRolePermission);
        adminPermissions.add(userRolePermission);
        adminPerfil.setPermissions(adminPermissions);

        Perfil regularPerfil = new Perfil();
        regularPerfil.setId(1L);
        regularPerfil.setName("Discente");
        Set<Permission> userPermissions = new HashSet<>();
        userPermissions.add(userRolePermission);
        regularPerfil.setPermissions(userPermissions);

        adminUser = new User();
        adminUser.setName("Admin User");
        adminUser.setEmail("admin@example.com");
        adminUser.setPerfil(adminPerfil);

        regularUser = new User();
        regularUser.setName("Regular User");
        regularUser.setEmail("regular@example.com");
        regularUser.setPerfil(regularPerfil);

        solicitationAdmin = new SolicitationAdmin();
        solicitationAdmin.setOrcamentoAnual(new BigDecimal("100000.00"));
        solicitationAdmin.setYear(2023);
    }

    @Test
    public void setBudget_WithAdminPermission_ReturnsOk() {
        when(userService.getLoggedUser()).thenReturn(adminUser);
        when(budgetService.setBudget(any(BigDecimal.class), anyInt())).thenReturn(solicitationAdmin);

        ResponseEntity<?> response = budgetController.setBudget(new BigDecimal("100000.00"), 2023);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(solicitationAdmin, response.getBody());
    }

    @Test
    public void setBudget_WithoutAdminPermission_ReturnsForbidden() {
        when(userService.getLoggedUser()).thenReturn(regularUser);

        ResponseEntity<?> response = budgetController.setBudget(new BigDecimal("100000.00"), 2023);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    public void viewBudgets_ReturnsBudgetForYear() {
        when(budgetService.getBudgetsByYear(2023)).thenReturn(solicitationAdmin);

        ResponseEntity<SolicitationAdmin> response = budgetController.viewBudgets(2023);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(solicitationAdmin, response.getBody());
    }

    @Test
    public void getTotalAssistanceRequestsValue_WithDefaultDates_ReturnsList() {
        LocalDate now = LocalDate.now();
        List<AssistanceIdValueDTO> expectedList = Arrays
                .asList(new AssistanceIdValueDTO(1L, new BigDecimal("5000.00"), now, now, "Avaliador", "TesteTeacher", "TestPerfil"));
        when(budgetService.getTotalApprovedAssistanceRequestsValue(any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(expectedList);

        ResponseEntity<List<AssistanceIdValueDTO>> response = budgetController.getTotalAssistanceRequestsValue(null,
                null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedList, response.getBody());
    }

    @Test
    public void getTotalAssistanceRequestsValue_WithCustomDates_ReturnsList() {
        LocalDate start = LocalDate.parse("01-01-2023", DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        LocalDate end = LocalDate.parse("31-12-2023", DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        List<AssistanceIdValueDTO> expectedList = Arrays
                .asList(new AssistanceIdValueDTO(1L, new BigDecimal("5000.00"), start, start, "Avaliador", "TesteTeacher", "TestPerfil"));

        when(budgetService.getTotalApprovedAssistanceRequestsValue(eq(start), eq(end)))
                .thenReturn(expectedList);

        ResponseEntity<List<AssistanceIdValueDTO>> response = budgetController
                .getTotalAssistanceRequestsValue("01-01-2023", "31-12-2023");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedList, response.getBody());
    }

    @Test
    public void getRemainingBudget_ReturnsCorrectValue() {
        BigDecimal expectedRemaining = new BigDecimal("75000.00");
        when(budgetService.getRemainingBudget(2023)).thenReturn(expectedRemaining);

        ResponseEntity<BigDecimal> response = budgetController.getRemainingBudget(2023);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedRemaining, response.getBody());
    }

    @Test
    public void getBudgetSummary_ReturnsCorrectSummary() {
        BigDecimal totalBudget = new BigDecimal("100000.00");
        BigDecimal usedBudget = new BigDecimal("25000.00");
        BigDecimal remainingBudget = new BigDecimal("75000.00");
        BudgetSummaryDTO expectedSummary = new BudgetSummaryDTO(2023, totalBudget, usedBudget, remainingBudget);

        when(budgetService.getBudgetsByYear(2023)).thenReturn(solicitationAdmin);
        when(budgetService.getUsedBudget(2023)).thenReturn(usedBudget);
        when(budgetService.getRemainingBudget(2023)).thenReturn(remainingBudget);

        ResponseEntity<BudgetSummaryDTO> response = budgetController.getBudgetSummary(2023);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedSummary.year(), response.getBody().year());
        assertEquals(expectedSummary.totalBudget(), response.getBody().totalBudget());
        assertEquals(expectedSummary.usedBudget(), response.getBody().usedBudget());
        assertEquals(expectedSummary.remainingBudget(), response.getBody().remainingBudget());
    }

    @Test
    public void getBudgetSummary_WhenBudgetNotFound_ReturnsEmptySummary() {
        when(budgetService.getBudgetsByYear(2023)).thenThrow(new NotFoundException("Budget not found"));

        ResponseEntity<BudgetSummaryDTO> response = budgetController.getBudgetSummary(2023);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2023, response.getBody().year());
        assertEquals(BigDecimal.ZERO, response.getBody().totalBudget());
        assertEquals(BigDecimal.ZERO, response.getBody().usedBudget());
        assertEquals(BigDecimal.ZERO, response.getBody().remainingBudget());
    }

    @Test
    public void getAvailableYears_ReturnsYearsList() {
        List<Integer> expectedYears = Arrays.asList(2021, 2022, 2023);
        when(budgetService.getAvailableYears()).thenReturn(expectedYears);

        ResponseEntity<List<Integer>> response = budgetController.getAvailableYears();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(expectedYears, response.getBody());
    }
}
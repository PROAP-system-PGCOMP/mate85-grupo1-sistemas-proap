package br.ufba.proap.solicitationadminpanel.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import br.ufba.proap.assistancerequest.repository.ExtraRequestRepostirory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import br.ufba.proap.assistancerequest.repository.AssistanceRequestRepository;
import br.ufba.proap.solicitationadminpanel.domain.SolicitationAdmin;
import br.ufba.proap.solicitationadminpanel.domain.dto.AssistanceIdValueDTO;
import br.ufba.proap.solicitationadminpanel.repository.SolicitationAdminRepository;
import jakarta.ws.rs.NotFoundException;

@ExtendWith(MockitoExtension.class)
public class BudgetServiceTest {

    @Mock
    private SolicitationAdminRepository repository;

    @Mock
    private AssistanceRequestRepository assistanceRequestRepository;

    @Mock
    private ExtraRequestRepostirory extraRequestRepostirory;

    @InjectMocks
    private BudgetService budgetService;

    private SolicitationAdmin solicitationAdmin;
    private final Integer testYear = 2023;
    private final BigDecimal testBudget = new BigDecimal("100000.00");

    @BeforeEach
    void setUp() {
        solicitationAdmin = new SolicitationAdmin();
        solicitationAdmin.setYear(testYear);
        solicitationAdmin.setOrcamentoAnual(testBudget);
    }

    @Test
    void testSetBudget_UpdateExistingBudget() {
        when(repository.findByYear(testYear)).thenReturn(Optional.of(solicitationAdmin));
        when(repository.save(any(SolicitationAdmin.class))).thenReturn(solicitationAdmin);

        BigDecimal newBudget = new BigDecimal("120000.00");
        SolicitationAdmin result = budgetService.setBudget(newBudget, testYear);

        assertEquals(newBudget, result.getOrcamentoAnual());
        assertEquals(testYear, result.getYear());
        verify(repository).save(solicitationAdmin);
    }

    @Test
    void testSetBudget_CreateNewBudget() {
        when(repository.findByYear(testYear)).thenReturn(Optional.empty());
        when(repository.save(any(SolicitationAdmin.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitationAdmin result = budgetService.setBudget(testBudget, testYear);

        assertEquals(testBudget, result.getOrcamentoAnual());
        assertEquals(testYear, result.getYear());
        verify(repository).save(any(SolicitationAdmin.class));
    }

    @Test
    void testSetBudget_NegativeBudget() {
        when(repository.findByYear(testYear)).thenReturn(Optional.empty());

        BigDecimal negativeBudget = new BigDecimal("-1.00");
        assertThrows(IllegalArgumentException.class, () -> budgetService.setBudget(negativeBudget, testYear));
    }

    @Test
    void testGetBudgetsByYear_Found() {
        when(repository.findByYear(testYear)).thenReturn(Optional.of(solicitationAdmin));

        SolicitationAdmin result = budgetService.getBudgetsByYear(testYear);

        assertEquals(solicitationAdmin, result);
    }

    @Test
    void testGetBudgetsByYear_NotFound() {
        when(repository.findByYear(testYear)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> budgetService.getBudgetsByYear(testYear));
    }

    @Test
    void testGetTotalApprovedAssistanceRequestsValue() {
        LocalDate startDate = LocalDate.of(2023, 1, 1);
        LocalDate endDate = LocalDate.of(2023, 12, 31);
        List<Object[]> mockResult = Arrays.asList(
                new Object[] { 1L, new BigDecimal("1000.00"), LocalDate.of(2023, 1, 15).atStartOfDay(),
                        LocalDate.of(2023, 2, 1), "Evaluator 1" },
                new Object[] { 2L, new BigDecimal("2000.00"), LocalDate.of(2023, 3, 10).atStartOfDay(),
                        LocalDate.of(2023, 3, 20), "Evaluator 2" });

        when(assistanceRequestRepository.findTotalApprovedValueByDateRange(startDate, endDate)).thenReturn(mockResult);

        List<AssistanceIdValueDTO> result = budgetService.getTotalApprovedAssistanceRequestsValue(startDate, endDate);

        assertEquals(2, result.size());
        assertEquals(1L, result.get(0).id());
        assertEquals(new BigDecimal("1000.00"), result.get(0).value());
        assertEquals(2L, result.get(1).id());
        assertEquals(new BigDecimal("2000.00"), result.get(1).value());
    }

    @Test
    void testGetRemainingBudget() {
        when(repository.findByYear(testYear)).thenReturn(Optional.of(solicitationAdmin));
        when(assistanceRequestRepository.findTotalApprovedValueByYear(testYear)).thenReturn(new BigDecimal("30000.00"));
        when(extraRequestRepostirory.findTotalApprovedValueByYear(testYear)).thenReturn(new BigDecimal("5000.00"));

        BigDecimal result = budgetService.getRemainingBudget(testYear);

        // 100000 - (30000 + 5000) = 65000.00
        assertEquals(new BigDecimal("65000.00"), result);
    }

    @Test
    void testGetRemainingBudget_NoBudget() {
        when(repository.findByYear(testYear)).thenReturn(Optional.empty());
        when(assistanceRequestRepository.findTotalApprovedValueByYear(testYear)).thenReturn(new BigDecimal("30000.00"));
        when(extraRequestRepostirory.findTotalApprovedValueByYear(testYear)).thenReturn(new BigDecimal("5000.00"));

        BigDecimal result = budgetService.getRemainingBudget(testYear);

        assertEquals(new BigDecimal("-35000.00"), result);
    }

    @Test
    void testGetRemainingBudget_NoSpending() {
        when(repository.findByYear(testYear)).thenReturn(Optional.of(solicitationAdmin));
        when(assistanceRequestRepository.findTotalApprovedValueByYear(testYear)).thenReturn(null);
        when(extraRequestRepostirory.findTotalApprovedValueByYear(testYear)).thenReturn(null);

        BigDecimal result = budgetService.getRemainingBudget(testYear);

        assertEquals(testBudget, result);
    }

    @Test
    void testGetUsedBudget() {
        when(repository.findByYear(testYear)).thenReturn(Optional.of(solicitationAdmin));
        when(assistanceRequestRepository.findTotalApprovedValueByYear(testYear)).thenReturn(new BigDecimal("30000.00"));

        BigDecimal result = budgetService.getUsedBudget(testYear);

        assertEquals(new BigDecimal("30000.00"), result);
    }

    @Test
    void testGetAvailableYears_CurrentYearNotIncluded() {
        List<Integer> years = new ArrayList<>(Arrays.asList(2021, 2022));
        when(repository.findAllAvailableYears()).thenReturn(years);

        int currentYear = LocalDate.now().getYear();
        List<Integer> result = budgetService.getAvailableYears();

        assertTrue(result.contains(currentYear));
        assertEquals(3, result.size());
    }

    @Test
    void testGetAvailableYears_CurrentYearAlreadyIncluded() {
        int currentYear = LocalDate.now().getYear();
        List<Integer> years = Arrays.asList(2021, 2022, currentYear);
        when(repository.findAllAvailableYears()).thenReturn(years);

        List<Integer> result = budgetService.getAvailableYears();

        assertTrue(result.contains(currentYear));
        assertEquals(3, result.size());
    }
}
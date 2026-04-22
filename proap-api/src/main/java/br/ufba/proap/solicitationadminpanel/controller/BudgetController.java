package br.ufba.proap.solicitationadminpanel.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.dto.StatusResponseDTO;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.solicitationadminpanel.domain.SolicitationAdmin;
import br.ufba.proap.solicitationadminpanel.service.BudgetService;
import br.ufba.proap.solicitationadminpanel.domain.dto.AssistanceIdValueDTO;
import br.ufba.proap.solicitationadminpanel.domain.dto.BudgetSummaryDTO;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/admin/budget")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserService userService;

    private static final Logger logger = LoggerFactory.getLogger(BudgetController.class);

    @Transactional
    private boolean hasAdminPermission() {
        try {
            User currentUser = userService.getLoggedUser();
            return currentUser.getPerfil() != null &&
                    currentUser.getPerfil().hasPermission("ADMIN_ROLE");
        } catch (Exception e) {
            logger.error("Erro ao verificar permissão: " + e.getMessage(), e);
            return false;
        }
    }

    private ResponseEntity<StatusResponseDTO> checkAdminPermission(String message) {
        if (!hasAdminPermission()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new StatusResponseDTO("error", message));
        }
        return null;
    }

    @PutMapping("/set")
    public ResponseEntity<?> setBudget(@RequestParam BigDecimal budget, @RequestParam Integer year) {
        ResponseEntity<StatusResponseDTO> permissionCheck = checkAdminPermission(
                "Você não tem permissão para alterar o orçamento.");
        if (permissionCheck != null) {
            return permissionCheck;
        }
        SolicitationAdmin solicitationAdmin = budgetService.setBudget(budget, year);
        return ResponseEntity.ok(solicitationAdmin);
    }

    @GetMapping("/view/{year}")
    public ResponseEntity<SolicitationAdmin> viewBudgets(@PathVariable Integer year) {
        SolicitationAdmin budgets = budgetService.getBudgetsByYear(year);
        return ResponseEntity.ok(budgets);
    }

    @GetMapping("/total-assistance-requests")
    public ResponseEntity<List<AssistanceIdValueDTO>> getTotalAssistanceRequestsValue(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        LocalDate start = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        LocalDate end = LocalDate.now();

        if (startDate != null) {
            start = LocalDate.parse(startDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        }

        if (endDate != null) {
            end = LocalDate.parse(endDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        }

        List<AssistanceIdValueDTO> totalValue = budgetService.getTotalApprovedAssistanceRequestsValue(start, end);
        return ResponseEntity.ok(totalValue);
    }

    @GetMapping("/remaining-budget/{year}")
    public ResponseEntity<BigDecimal> getRemainingBudget(@PathVariable Integer year) {
        BigDecimal remainingBudget = budgetService.getRemainingBudget(year);
        return ResponseEntity.ok(remainingBudget);
    }

    @GetMapping("/summary/{year}")
    public ResponseEntity<BudgetSummaryDTO> getBudgetSummary(@PathVariable Integer year) {
        try {
            BigDecimal totalBudget = budgetService.getBudgetsByYear(year).getOrcamentoAnual();

            BigDecimal usedBudget = budgetService.getUsedBudget(year);

            BigDecimal remainingBudget = budgetService.getRemainingBudget(year);

            BudgetSummaryDTO summary = new BudgetSummaryDTO(
                    year,
                    totalBudget,
                    usedBudget,
                    remainingBudget);

            return ResponseEntity.ok(summary);
        } catch (NotFoundException e) {
            BudgetSummaryDTO emptyBudget = new BudgetSummaryDTO(
                    year,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO);

            return ResponseEntity.ok(emptyBudget);
        }
    }

    @GetMapping("/available-years")
    public ResponseEntity<List<Integer>> getAvailableYears() {
        List<Integer> years = budgetService.getAvailableYears();
        return ResponseEntity.ok(years);
    }
}

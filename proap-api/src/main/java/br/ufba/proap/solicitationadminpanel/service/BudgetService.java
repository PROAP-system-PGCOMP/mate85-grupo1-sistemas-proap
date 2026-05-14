package br.ufba.proap.solicitationadminpanel.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufba.proap.assistancerequest.repository.AssistanceRequestRepository;
import br.ufba.proap.solicitationadminpanel.domain.SolicitationAdmin;
import br.ufba.proap.solicitationadminpanel.domain.dto.AssistanceIdValueDTO;
import br.ufba.proap.solicitationadminpanel.domain.dto.SolicitorAccumulatedValueDTO;
import br.ufba.proap.solicitationadminpanel.repository.SolicitationAdminRepository;
import jakarta.ws.rs.NotFoundException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class BudgetService {

    @Autowired
    private SolicitationAdminRepository repository;

    @Autowired
    private AssistanceRequestRepository assistanteRequestRepository;

    @Transactional
    public SolicitationAdmin setBudget(BigDecimal budget, Integer year) {

        SolicitationAdmin existingBudget = repository.findByYear(year).orElse(null);
        if (existingBudget != null) {
            existingBudget.setOrcamentoAnual(budget);
            return repository.save(existingBudget);
        }
        if (budget.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Budget cannot be negative");
        }

        SolicitationAdmin solicitationAdmin = new SolicitationAdmin();
        solicitationAdmin.setOrcamentoAnual(budget);
        solicitationAdmin.setYear(year);
        return repository.save(solicitationAdmin);
    }

    public SolicitationAdmin getBudgetsByYear(Integer year) {
        return repository.findByYear(year)
                .orElseThrow(() -> new NotFoundException("Budget not found for year: " + year));
    }

    @Transactional
    public List<AssistanceIdValueDTO> getTotalApprovedAssistanceRequestsValue(LocalDate startDate, LocalDate endDate) {
        return AssistanceIdValueDTO
                .convertPairsToDTOs(assistanteRequestRepository.findTotalApprovedValueByDateRange(startDate, endDate));
    }

    @Transactional
    public BigDecimal getRemainingBudget(Integer year) {
        BigDecimal totalBudget = repository.findByYear(year)
                .map(SolicitationAdmin::getOrcamentoAnual)
                .orElse(BigDecimal.ZERO);

        BigDecimal totalSpent = assistanteRequestRepository.findTotalApprovedValueByYear(year) != null
                ? assistanteRequestRepository.findTotalApprovedValueByYear(year)
                : BigDecimal.ZERO;
        return totalBudget.subtract(totalSpent);
    }

    @Transactional
    public BigDecimal getUsedBudget(Integer year) {
        BigDecimal totalBudget = repository.findByYear(year)
                .map(SolicitationAdmin::getOrcamentoAnual)
                .orElse(BigDecimal.ZERO);

        BigDecimal remainingBudget = getRemainingBudget(year);

        return totalBudget.subtract(remainingBudget);
    }

    @Transactional
    public List<SolicitorAccumulatedValueDTO> getAccumulatedValueBySolicitorDocente() {
        return SolicitorAccumulatedValueDTO.fromObjectArrayList(
                assistanteRequestRepository.findAccumulatedValueBySolicitorDocente());
    }

    @Transactional
    public List<Integer> getAvailableYears() {
        List<Integer> years = repository.findAllAvailableYears();

        int currentYear = LocalDate.now().getYear();
        if (!years.contains(currentYear)) {
            years.add(currentYear);
        }

        return years;
    }
}
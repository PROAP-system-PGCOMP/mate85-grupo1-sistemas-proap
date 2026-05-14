package br.ufba.proap.solicitationadminpanel.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import br.ufba.proap.solicitationadminpanel.domain.dto.CeapgResponseDTO;
import br.ufba.proap.solicitationadminpanel.service.CeapgService;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/ceapg")
public class CeapgController {

    @Autowired
    private CeapgService ceapgService;

    Pair<LocalDate, LocalDate> validateDate(String startDate, String endDate) {
        LocalDate start = LocalDate.of(LocalDate.now().getYear(), 1, 1);
        LocalDate end = LocalDate.now();

        if (startDate != null) {
            start = LocalDate.parse(startDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        }

        if (endDate != null) {
            end = LocalDate.parse(endDate, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        }

        return Pair.of(start, end);
    }

    @GetMapping
    public ResponseEntity<?> getAllCeapgRequests(@RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Pair<LocalDate, LocalDate> dates = validateDate(startDate, endDate);
        List<CeapgResponseDTO> ceapgResponseDTO = ceapgService.getCeapgRequests(dates.getFirst(), dates.getSecond());
        return ResponseEntity.ok(ceapgResponseDTO);

    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingCeapgRequests(@RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Pair<LocalDate, LocalDate> dates = validateDate(startDate, endDate);
        List<CeapgResponseDTO> ceapgResponseDTO = ceapgService.getPendingCeapgRequests(dates.getFirst(),
                dates.getSecond());
        return ResponseEntity.ok(ceapgResponseDTO);
    }

    @GetMapping("/completed")
    public ResponseEntity<?> getCompletedCeapgRequests(@RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        Pair<LocalDate, LocalDate> dates = validateDate(startDate, endDate);
        List<CeapgResponseDTO> ceapgResponseDTO = ceapgService.getCompletedCeapgRequests(dates.getFirst(),
                dates.getSecond());
        return ResponseEntity.ok(ceapgResponseDTO);
    }
}

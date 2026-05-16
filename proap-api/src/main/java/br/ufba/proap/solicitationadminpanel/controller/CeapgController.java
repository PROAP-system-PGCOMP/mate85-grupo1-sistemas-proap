package br.ufba.proap.solicitationadminpanel.controller;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.solicitationadminpanel.domain.dto.CeapgReviewDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Pair;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import br.ufba.proap.solicitationadminpanel.domain.dto.CeapgResponseDTO;
import br.ufba.proap.solicitationadminpanel.service.CeapgService;

@RestController
@RequestMapping("/api/admin/ceapg")
public class CeapgController {

    @Autowired
    private CeapgService ceapgService;

    @Autowired
    private UserService userService;

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

    @PatchMapping("review/{id}")
    public ResponseEntity<AssistanceRequest> reviewCeapgRequest(@PathVariable Long id, @RequestBody CeapgReviewDTO data) {
        User currentUser = userService.getLoggedUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        AssistanceRequest reviewedRequest = ceapgService.reviewCeapgRequest(id, data, currentUser);

        return ResponseEntity.ok().body(reviewedRequest);
    }
}

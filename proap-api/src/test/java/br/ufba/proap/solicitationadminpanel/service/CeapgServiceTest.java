package br.ufba.proap.solicitationadminpanel.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import br.ufba.proap.assistancerequest.repository.AssistanceRequestRepository;
import br.ufba.proap.solicitationadminpanel.domain.dto.CeapgResponseDTO;
import jakarta.ws.rs.NotFoundException;

@ExtendWith(MockitoExtension.class)
public class CeapgServiceTest {

    @Mock
    private AssistanceRequestRepository assistanceRequestRepository;

    @Spy
    @InjectMocks
    private CeapgService ceapgService;

    private LocalDate startDate;
    private LocalDate endDate;
    private List<Object[]> mockData;
    private List<CeapgResponseDTO> expectedDtos;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2023, 1, 1);
        endDate = LocalDate.of(2023, 12, 31);

        mockData = new ArrayList<>();
        mockData.add(new Object[] { 1L, new BigDecimal("1000.00"), LocalDate.of(2023, 2, 15),
                "Avaliador 1", new BigDecimal("900.00"), "Observação", "Avaliador CEAPG", LocalDate.of(2023, 3, 1) });

        expectedDtos = new ArrayList<>();
        CeapgResponseDTO dto = new CeapgResponseDTO(1L, new BigDecimal("1000.00"), LocalDate.of(2023, 2, 15),
                "Avaliador 1", new BigDecimal("900.00"), "Observação", "Avaliador CEAPG", LocalDate.of(2023, 3, 1), "10");
        expectedDtos.add(dto);
    }

    @Test
    void getCeapgRequests_WhenNoData_ShouldThrowNotFoundException() {
        when(assistanceRequestRepository.findAllCeapgRequests(startDate, endDate))
                .thenReturn(Collections.emptyList());

        assertThrows(NotFoundException.class, () -> ceapgService.getCeapgRequests(startDate, endDate));
        verify(assistanceRequestRepository).findAllCeapgRequests(startDate, endDate);
    }

    @Test
    void getCeapgRequests_WhenDataExists_ShouldReturnDTOs() {
        when(assistanceRequestRepository.findAllCeapgRequests(startDate, endDate))
                .thenReturn(mockData);
        doReturn(expectedDtos).when(ceapgService).convertPairsToDTOs(mockData);

        List<CeapgResponseDTO> result = ceapgService.getCeapgRequests(startDate, endDate);

        verify(assistanceRequestRepository).findAllCeapgRequests(startDate, endDate);
        assertEquals(expectedDtos, result);
    }

    @Test
    void getPendingCeapgRequests_WhenNoData_ShouldThrowNotFoundException() {
        when(assistanceRequestRepository.findAllPendingCeapgRequests(startDate, endDate))
                .thenReturn(Collections.emptyList());

        assertThrows(NotFoundException.class, () -> ceapgService.getPendingCeapgRequests(startDate, endDate));
        verify(assistanceRequestRepository).findAllPendingCeapgRequests(startDate, endDate);
    }

    @Test
    void getPendingCeapgRequests_WhenDataExists_ShouldReturnDTOs() {
        when(assistanceRequestRepository.findAllPendingCeapgRequests(startDate, endDate))
                .thenReturn(mockData);
        doReturn(expectedDtos).when(ceapgService).convertPairsToDTOs(mockData);

        List<CeapgResponseDTO> result = ceapgService.getPendingCeapgRequests(startDate, endDate);

        verify(assistanceRequestRepository).findAllPendingCeapgRequests(startDate, endDate);
        assertEquals(expectedDtos, result);
    }

    @Test
    void getCompletedCeapgRequests_WhenNoData_ShouldThrowNotFoundException() {
        when(assistanceRequestRepository.findAllCompletedCeapgRequests(startDate, endDate))
                .thenReturn(Collections.emptyList());

        assertThrows(NotFoundException.class, () -> ceapgService.getCompletedCeapgRequests(startDate, endDate));
        verify(assistanceRequestRepository).findAllCompletedCeapgRequests(startDate, endDate);
    }

    @Test
    void getCompletedCeapgRequests_WhenDataExists_ShouldReturnDTOs() {
        when(assistanceRequestRepository.findAllCompletedCeapgRequests(startDate, endDate))
                .thenReturn(mockData);
        doReturn(expectedDtos).when(ceapgService).convertPairsToDTOs(mockData);

        List<CeapgResponseDTO> result = ceapgService.getCompletedCeapgRequests(startDate, endDate);

        verify(assistanceRequestRepository).findAllCompletedCeapgRequests(startDate, endDate);
        assertEquals(expectedDtos, result);
    }
}
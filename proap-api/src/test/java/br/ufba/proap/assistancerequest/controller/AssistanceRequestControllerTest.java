package br.ufba.proap.assistancerequest.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.*;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.*;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import br.ufba.proap.assistancerequest.domain.AssistanceRequest;
import br.ufba.proap.assistancerequest.domain.Review;
import br.ufba.proap.assistancerequest.domain.dto.*;
import br.ufba.proap.assistancerequest.service.*;
import br.ufba.proap.authentication.domain.User;
import br.ufba.proap.authentication.domain.Perfil;
import br.ufba.proap.authentication.domain.dto.UserResponseDTO;
import br.ufba.proap.authentication.service.UserService;
import br.ufba.proap.exception.UnauthorizedException;
import br.ufba.proap.filestorage.FileService;

class AssistanceRequestControllerTest {

        @Mock
        private AssistanceRequestService service;
        @Mock
        private ReviewService reviewService;
        @Mock
        private UserService userService;
        @Mock
        private FileService fileService;

        @InjectMocks
        private AssistanceRequestController controller;

        private MockMvc mvc;
        private User mockUser;
        private User adminUser;
        private ObjectMapper objectMapper;
        private AssistanceRequest mockRequest;
        private ResponseAssistanceRequestDTO mockResponse;

        @BeforeEach
        void setUp() throws Exception {
                MockitoAnnotations.openMocks(this);
                mvc = MockMvcBuilders.standaloneSetup(controller).build();

                Perfil mockPerfil = Mockito.mock(Perfil.class);
                when(mockPerfil.getId()).thenReturn(1L);
                when(mockPerfil.getName()).thenReturn("TestPerfil");
                when(mockPerfil.hasPermission(anyString())).thenReturn(false);

                Perfil adminPerfil = Mockito.mock(Perfil.class);
                when(adminPerfil.getId()).thenReturn(2L);
                when(adminPerfil.getName()).thenReturn("AdminPerfil");
                when(adminPerfil.hasPermission("VIEW_ALL_REQUESTS")).thenReturn(true);
                when(adminPerfil.hasPermission("APPROVE_REQUEST")).thenReturn(true);

                mockUser = new User("Usuario Teste", "owner@ufba.br", "password");
                setPrivateField(mockUser, "id", 1L);
                mockUser.setPerfil(mockPerfil);
                setPrivateField(mockUser, "cpf", "12345678901");
                setPrivateField(mockUser, "registration", "123456");
                setPrivateField(mockUser, "phone", "71999999999");
                setPrivateField(mockUser, "alternativePhone", "71888888888");

                adminUser = new User("Admin Teste", "admin@ufba.br", "password");
                setPrivateField(adminUser, "id", 2L);
                adminUser.setPerfil(adminPerfil);
                setPrivateField(adminUser, "cpf", "00000000000");
                setPrivateField(adminUser, "registration", "000000");
                setPrivateField(adminUser, "phone", "71000000000");
                setPrivateField(adminUser, "alternativePhone", "71111111111");

                mockRequest = new AssistanceRequest();
                setPrivateField(mockRequest, "id", 1L);
                setPrivateField(mockRequest, "tituloPublicacao", "Teste");
                setPrivateField(mockRequest, "situacao", 0);
                setPrivateField(mockRequest, "user", mockUser);

                UserResponseDTO ownerUserResponseDTO = UserResponseDTO.fromUser(mockUser);
                mockResponse = new ResponseAssistanceRequestDTO(
                                1L, ownerUserResponseDTO, null, null, "Teste", Collections.emptyList(), false, false,
                                null, null,
                                false, 0, null, false, null, null, 1,  null, null, null, null, null,
                                BigDecimal.ZERO, null, 0, BigDecimal.ZERO, false, false, BigDecimal.ZERO,
                                BigDecimal.ZERO, BigDecimal.ZERO, null, "Justificativa Original", false, 0,
                                null, null, null, 0, BigDecimal.ZERO, null, null, BigDecimal.ZERO, null,
                                BigDecimal.ZERO, null, null);

                objectMapper = new ObjectMapper();
                objectMapper.registerModule(new JavaTimeModule());
        }

        private void setPrivateField(Object target, String fieldName, Object value) throws Exception {
                Field field = target.getClass().getDeclaredField(fieldName);
                if (field == null && target.getClass().getSuperclass() != null) {
                        field = target.getClass().getSuperclass().getDeclaredField(fieldName);
                }
                field.setAccessible(true);
                field.set(target, value);
        }

        @Test
        @DisplayName("GET /assistancerequest/list returns 401 when user not logged")
        void list_shouldReturn401_whenNoUser() throws Exception {
                when(userService.getLoggedUser()).thenReturn(null);

                mvc.perform(MockMvcRequestBuilders.get("/api/assistancerequest/list")
                                .param("sortBy", "createdAt")
                                .param("ascending", "true")
                                .param("page", "0")
                                .param("size", "10"))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.list", hasSize(0)));
        }

        @Test
        @DisplayName("GET /assistancerequest/list returns 200 and data when user logged in")
        void list_shouldReturnData_whenUserLoggedIn() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);

                AssistanceRequestService.AssistanceRequestListFiltered result = new AssistanceRequestService.AssistanceRequestListFiltered(
                                Collections.singletonList(Mockito.mock(ResponseAssistanceRequestDTO.class)),
                                1);

                when(service.find(eq("createdAt"), eq(true), eq(0), eq(10), eq(mockUser)))
                                .thenReturn(result);

                mvc.perform(MockMvcRequestBuilders.get("/api/assistancerequest/list")
                                .param("sortBy", "createdAt")
                                .param("ascending", "true")
                                .param("page", "0")
                                .param("size", "10"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.list", hasSize(1)))
                                .andExpect(jsonPath("$.total", is(1)));
        }

        @Test
        @DisplayName("GET /assistancerequest/list/{userId} returns user's requests")
        void listById_shouldReturnUserRequests() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);

                List<AssistanceRequest> requests = new ArrayList<>();
                requests.add(mockRequest);

                when(service.findByUser(mockUser)).thenReturn(requests);

                mvc.perform(MockMvcRequestBuilders.get("/api/assistancerequest/list/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("GET /assistancerequest/list/{userId} returns empty list when user not logged")
        void listById_shouldReturnEmptyList_whenNoUser() throws Exception {
                when(userService.getLoggedUser()).thenReturn(null);

                mvc.perform(MockMvcRequestBuilders.get("/api/assistancerequest/list/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(0)));

                verify(service, never()).findByUser(any());
        }

        @Test
        @DisplayName("GET /assistancerequest/find/{id} returns 200 when user is owner")
        void findById_shouldReturnRequest_whenUserIsOwner() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                ResponseAssistanceRequestDTO responseOwnedByMockUser = new ResponseAssistanceRequestDTO(
                                mockResponse.id(), UserResponseDTO.fromUser(mockUser), mockResponse.avaliadorProap(),
                                mockResponse.avaliadorCeapg(),
                                mockResponse.tituloPublicacao(), mockResponse.coautores(),
                                mockResponse.algumCoautorPGCOMP(), mockResponse.solicitanteDocente(),
                                mockResponse.nomeDocente(), mockResponse.nomeDiscente(),
                                mockResponse.discenteNoPrazoDoCurso(), mockResponse.mesesAtrasoCurso(),
                                mockResponse.nomeEvento(), mockResponse.eventoInternacional(),
                                mockResponse.dataInicio(), mockResponse.dataFim(),
                                mockResponse.qtdDiasEvento(), mockResponse.linkHomePageEvento(),
                                mockResponse.cidade(), mockResponse.pais(), mockResponse.qualis(),
                                mockResponse.modalidadeParticipacao(),
                                mockResponse.valorInscricao(), mockResponse.linkPaginaInscricao(),
                                mockResponse.quantidadeDiariasSolicitadas(),
                                mockResponse.valorDiaria(), mockResponse.ultimaDiariaIntegral(), mockResponse.isDolar(),
                                mockResponse.cotacaoMoeda(),
                                mockResponse.valorPassagem(), mockResponse.valorTotal(), mockResponse.cartaAceite(),
                                mockResponse.justificativa(),
                                mockResponse.aceiteFinal(), mockResponse.situacao(),
                                mockResponse.comprovantePagamento(), mockResponse.numeroAta(),
                                mockResponse.dataAvaliacaoProap(), mockResponse.numeroDiariasAprovadas(),
                                mockResponse.valorAprovado(),
                                mockResponse.observacao(), mockResponse.automaticDecText(),
                                mockResponse.custoFinalCeapg(),
                                mockResponse.observacoesCeapg(), mockResponse.percentualOrcamentoAnual(),
                                mockResponse.createdAt(), mockResponse.updatedAt());
                when(service.findById(1L)).thenReturn(Optional.of(responseOwnedByMockUser));

                mvc.perform(MockMvcRequestBuilders.get("/api/assistancerequest/find/1"))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("GET /assistancerequest/find/{id} returns 200 when user has permission")
        void findById_shouldReturnRequest_whenUserHasPermission() throws Exception {
                when(userService.getLoggedUser()).thenReturn(adminUser);
                when(service.findById(1L)).thenReturn(Optional.of(mockResponse));

                mvc.perform(MockMvcRequestBuilders.get("/api/assistancerequest/find/1"))
                                .andExpect(status().isOk());
        }

        @Test
        @DisplayName("GET /assistancerequest/find/{id} returns 404 when request not found")
        void findById_shouldReturn404_whenRequestNotFound() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.findById(1L)).thenReturn(Optional.empty());

                mvc.perform(MockMvcRequestBuilders.get("/api/assistancerequest/find/1"))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("POST /assistancerequest/create creates request successfully")
        void create_shouldCreateRequest() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.save(any(AssistanceRequest.class))).thenReturn(mockRequest);

                AssistanceRequest newRequest = new AssistanceRequest();

                mvc.perform(MockMvcRequestBuilders.post("/api/assistancerequest/create")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(newRequest)))
                                .andExpect(status().isOk());

                verify(service).save(any(AssistanceRequest.class));
        }

        @Test
        @DisplayName("POST /assistancerequest/create returns 400 when user not logged")
        void create_shouldReturn400_whenNoUser() throws Exception {
                when(userService.getLoggedUser()).thenReturn(null);

                AssistanceRequest newRequest = new AssistanceRequest();

                mvc.perform(MockMvcRequestBuilders.post("/api/assistancerequest/create")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(newRequest)))
                                .andExpect(status().isBadRequest());

                verify(service, never()).save(any(AssistanceRequest.class));
        }

        @Test
        @DisplayName("POST /assistancerequest/create-with-file uploads PDF and creates request")
        void createWithFile_shouldUploadPdf() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(fileService.uploadPdf(any(MultipartFile.class))).thenReturn("123.pdf");

                when(service.save(any(AssistanceRequest.class))).thenAnswer(invocation -> {
                        AssistanceRequest req = invocation.getArgument(0);
                        Field idField = AssistanceRequest.class.getDeclaredField("id");
                        idField.setAccessible(true);
                        idField.set(req, 1L);
                        return req;
                });

                CreateAssistanceRequestDTO dto = new CreateAssistanceRequestDTO(
                                "Titulo", List.of(), false, true, "Prof", "Disc",
                                true, 0, "CONF", false, LocalDate.now(), LocalDate.now().plusDays(2),
                                1, "", "Cidade", "BR", "", "Modal",
                                BigDecimal.ZERO, "", 0, BigDecimal.ZERO, false, false,
                                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, "Just");

                MockMultipartFile form = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(dto));
                MockMultipartFile pdf = new MockMultipartFile("file", "file.pdf", "application/pdf",
                                "dummy".getBytes());

                mvc.perform(MockMvcRequestBuilders.multipart("/api/assistancerequest/create-with-file")
                                .file(form)
                                .file(pdf)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isOk());

                verify(fileService).uploadPdf(any(MultipartFile.class));
                verify(service).save(any(AssistanceRequest.class));
        }

        @Test
        @DisplayName("POST /assistancerequest/create-with-file returns 415 when file is not PDF")
        void createWithFile_shouldReturn415_whenNotPdf() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(fileService.uploadPdf(any(MultipartFile.class)))
                                .thenThrow(new IllegalArgumentException("Somente arquivos PDF são permitidos"));

                CreateAssistanceRequestDTO dto = new CreateAssistanceRequestDTO(
                                "Titulo", List.of(), false, true, "Prof", "Disc",
                                true, 0, "CONF", false, LocalDate.now(), LocalDate.now().plusDays(2),
                                1,  "", "Cidade", "BR", "", "Modal",
                                BigDecimal.ZERO, "", 0, BigDecimal.ZERO, false, false,
                                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, "Just");

                MockMultipartFile form = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(dto));
                MockMultipartFile txt = new MockMultipartFile("file", "file.txt", "text/plain", "oops".getBytes());

                mvc.perform(MockMvcRequestBuilders.multipart("/api/assistancerequest/create-with-file")
                                .file(form)
                                .file(txt)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isUnsupportedMediaType());
        }

        @Test
        @DisplayName("PUT /assistancerequest/update updates request when user is owner and request is PENDING (no status change)")
        void update_shouldUpdateRequest_whenUserIsOwnerAndRequestIsPending() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.findById(1L)).thenReturn(Optional.of(mockResponse));

                ResponseAssistanceRequestDTO requestBodyDto = new ResponseAssistanceRequestDTO(
                                1L,
                                null,
                                null, null,
                                "Título Atualizado pelo Dono",
                                mockResponse.coautores(), mockResponse.algumCoautorPGCOMP(),
                                mockResponse.solicitanteDocente(),
                                mockResponse.nomeDocente(), mockResponse.nomeDiscente(),
                                mockResponse.discenteNoPrazoDoCurso(),
                                mockResponse.mesesAtrasoCurso(), mockResponse.nomeEvento(),
                                mockResponse.eventoInternacional(),
                                mockResponse.dataInicio(), mockResponse.dataFim(),
                                mockResponse.qtdDiasEvento(), mockResponse.linkHomePageEvento(),
                                mockResponse.cidade(),
                                mockResponse.pais(), mockResponse.qualis(), mockResponse.modalidadeParticipacao(),
                                mockResponse.valorInscricao(), mockResponse.linkPaginaInscricao(),
                                mockResponse.quantidadeDiariasSolicitadas(), mockResponse.valorDiaria(),
                                mockResponse.ultimaDiariaIntegral(), mockResponse.isDolar(),
                                mockResponse.cotacaoMoeda(),
                                mockResponse.valorPassagem(), mockResponse.valorTotal(), mockResponse.cartaAceite(),
                                "Justificativa Atualizada",
                                mockResponse.aceiteFinal(),
                                0,
                                mockResponse.comprovantePagamento(), mockResponse.numeroAta(),
                                mockResponse.dataAvaliacaoProap(),
                                mockResponse.numeroDiariasAprovadas(), mockResponse.valorAprovado(),
                                mockResponse.observacao(),
                                mockResponse.automaticDecText(), mockResponse.custoFinalCeapg(),
                                mockResponse.observacoesCeapg(),
                                mockResponse.percentualOrcamentoAnual(), mockResponse.createdAt(),
                                mockResponse.updatedAt());

                AssistanceRequest expectedSavedRequest = new AssistanceRequest();
                setPrivateField(expectedSavedRequest, "id", mockResponse.id());
                expectedSavedRequest.setTituloPublicacao("Título Atualizado pelo Dono");
                expectedSavedRequest.setJustificativa("Justificativa Atualizada");
                expectedSavedRequest.setSituacao(0);
                User ownerEntity = new User();
                setPrivateField(ownerEntity, "id", mockUser.getId());
                ownerEntity.setEmail(mockUser.getEmail());
                expectedSavedRequest.setUser(ownerEntity);

                when(service.save(any(AssistanceRequest.class))).thenReturn(expectedSavedRequest);
                when(userService.findByEmail(mockUser.getEmail())).thenReturn(Optional.of(mockUser));

                MockMultipartFile formPart = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(requestBodyDto));

                mvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/assistancerequest/update")
                                .file(formPart)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.tituloPublicacao", is("Título Atualizado pelo Dono")));

                verify(service).save(any(AssistanceRequest.class));
                verify(fileService, never()).uploadPdf(any(MultipartFile.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/update returns 403 when user is not owner, cannot approve, AND request is PENDING")
        void update_shouldReturn403_whenNotOwnerAndCannotApproveAndRequestIsPending() throws Exception {
                User otherUser = new User("Other User", "other@ufba.br", "password");
                setPrivateField(otherUser, "id", 3L);
                Perfil otherUserPerfil = Mockito.mock(Perfil.class);
                when(otherUserPerfil.hasPermission("APPROVE_REQUEST")).thenReturn(false);
                otherUser.setPerfil(otherUserPerfil);
                // Adicionar campos que faltavam para o construtor de UserResponseDTO via
                // fromUser para otherUser
                setPrivateField(otherUser, "cpf", "11122233344");
                setPrivateField(otherUser, "registration", "654321");
                setPrivateField(otherUser, "phone", "71777777777");
                setPrivateField(otherUser, "alternativePhone", "71666666666");
                when(userService.getLoggedUser()).thenReturn(otherUser);

                when(service.findById(1L)).thenReturn(Optional.of(mockResponse));

                ResponseAssistanceRequestDTO requestBodyDto = new ResponseAssistanceRequestDTO(
                                1L, null, null, null, "Título Atualizado", Collections.emptyList(), false, false, null,
                                null,
                                false, 0, null, false, null, null, 1, null, null, null, null, null,
                                BigDecimal.ZERO, null, 0, BigDecimal.ZERO, false, false, BigDecimal.ZERO,
                                BigDecimal.ZERO, BigDecimal.ZERO, null, null, false, 1,
                                null, null, null, 0, BigDecimal.ZERO, null, null, BigDecimal.ZERO, null,
                                BigDecimal.ZERO, null, null);

                MockMultipartFile formPart = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(requestBodyDto));

                mvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/assistancerequest/update")
                                .file(formPart)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isForbidden());

                verify(service, never()).save(any(AssistanceRequest.class));
                verify(fileService, never()).uploadPdf(any(MultipartFile.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/update returns 403 when request is NOT PENDING and user cannot approve (even if owner)")
        void update_shouldReturn403_whenNotPendingAndCannotApprove() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);

                UserResponseDTO ownerUserResponseDTO = UserResponseDTO.fromUser(mockUser);
                ResponseAssistanceRequestDTO existingApprovedRequestDto = new ResponseAssistanceRequestDTO(
                                1L, ownerUserResponseDTO, null, null, "Teste Aprovado", Collections.emptyList(), false,
                                false, null, null,
                                false, 0, null, false, null, null, 1, null, null, null, null, null,
                                BigDecimal.ZERO, null, 0, BigDecimal.ZERO, false, false, BigDecimal.ZERO,
                                BigDecimal.ZERO, BigDecimal.ZERO, null, null, false, 1,
                                null, null, null, 0, BigDecimal.ZERO, null, null, BigDecimal.ZERO, null,
                                BigDecimal.ZERO, null, null);

                when(service.findById(1L)).thenReturn(Optional.of(existingApprovedRequestDto));

                ResponseAssistanceRequestDTO requestBodyDto = new ResponseAssistanceRequestDTO(
                                1L, null, null, null, "Título Atualizado de Aprovada", Collections.emptyList(), false,
                                false, null, null,
                                false, 0, null, false, null, null, 1, null, null, null, null, null,
                                BigDecimal.ZERO, null, 0, BigDecimal.ZERO, false, false, BigDecimal.ZERO,
                                BigDecimal.ZERO, BigDecimal.ZERO, null, null, false, 2,
                                null, null, null, 0, BigDecimal.ZERO, null, null, BigDecimal.ZERO, null,
                                BigDecimal.ZERO, null, null);

                MockMultipartFile formPart = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(requestBodyDto));

                mvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/assistancerequest/update")
                                .file(formPart)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isForbidden());

                verify(service, never()).save(any(AssistanceRequest.class));
                verify(fileService, never()).uploadPdf(any(MultipartFile.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/update allows ADMIN to update ANY PENDING request (e.g., change status to Approved)")
        void update_shouldAllowAdminToUpdatePendingRequestStatusToApproved() throws Exception {
                when(userService.getLoggedUser()).thenReturn(adminUser);
                when(service.findById(1L)).thenReturn(Optional.of(mockResponse));

                ResponseAssistanceRequestDTO requestBodyDto = new ResponseAssistanceRequestDTO(
                                1L,
                                null,
                                null, null,
                                mockResponse.tituloPublicacao(),
                                mockResponse.coautores(), mockResponse.algumCoautorPGCOMP(),
                                mockResponse.solicitanteDocente(),
                                mockResponse.nomeDocente(), mockResponse.nomeDiscente(),
                                mockResponse.discenteNoPrazoDoCurso(),
                                mockResponse.mesesAtrasoCurso(), mockResponse.nomeEvento(),
                                mockResponse.eventoInternacional(),
                                mockResponse.dataInicio(), mockResponse.dataFim(),
                                mockResponse.qtdDiasEvento(), mockResponse.linkHomePageEvento(),
                                mockResponse.cidade(),
                                mockResponse.pais(), mockResponse.qualis(), mockResponse.modalidadeParticipacao(),
                                mockResponse.valorInscricao(), mockResponse.linkPaginaInscricao(),
                                mockResponse.quantidadeDiariasSolicitadas(), mockResponse.valorDiaria(),
                                mockResponse.ultimaDiariaIntegral(), mockResponse.isDolar(),
                                mockResponse.cotacaoMoeda(),
                                mockResponse.valorPassagem(), mockResponse.valorTotal(), mockResponse.cartaAceite(),
                                mockResponse.justificativa(),
                                mockResponse.aceiteFinal(),
                                1,
                                mockResponse.comprovantePagamento(), mockResponse.numeroAta(),
                                mockResponse.dataAvaliacaoProap(),
                                mockResponse.numeroDiariasAprovadas(), mockResponse.valorAprovado(),
                                mockResponse.observacao(),
                                mockResponse.automaticDecText(), mockResponse.custoFinalCeapg(),
                                mockResponse.observacoesCeapg(),
                                mockResponse.percentualOrcamentoAnual(), mockResponse.createdAt(),
                                mockResponse.updatedAt());

                AssistanceRequest expectedSavedRequest = new AssistanceRequest();
                setPrivateField(expectedSavedRequest, "id", mockResponse.id());
                expectedSavedRequest.setTituloPublicacao(mockResponse.tituloPublicacao());
                expectedSavedRequest.setSituacao(1);
                User ownerEntity = new User();
                setPrivateField(ownerEntity, "id", mockUser.getId());
                ownerEntity.setEmail(mockUser.getEmail());
                expectedSavedRequest.setUser(ownerEntity);

                when(service.save(any(AssistanceRequest.class))).thenReturn(expectedSavedRequest);
                when(userService.findByEmail(mockUser.getEmail())).thenReturn(Optional.of(mockUser));

                MockMultipartFile formPart = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(requestBodyDto));

                mvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/assistancerequest/update")
                                .file(formPart)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.situacao", is(1)));

                verify(service).save(any(AssistanceRequest.class));
                verify(fileService, never()).uploadPdf(any(MultipartFile.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/update with file upload by owner on PENDING request")
        void update_shouldAllowOwnerToUpdateAndUploadFileOnPendingRequest() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.findById(1L)).thenReturn(Optional.of(mockResponse));
                when(userService.findByEmail(mockUser.getEmail())).thenReturn(Optional.of(mockUser));

                ResponseAssistanceRequestDTO requestBodyDto = new ResponseAssistanceRequestDTO(
                                1L, null, null, null, "Título com Arquivo", Collections.emptyList(), false, false, null,
                                null,
                                false, 0, null, false, null, null, 1, null, null, null, null, null,
                                BigDecimal.ZERO, null, 0, BigDecimal.ZERO, false, false, BigDecimal.ZERO,
                                BigDecimal.ZERO, BigDecimal.ZERO, null, "Justificativa com arquivo", false, 0,
                                null, null, null, 0, BigDecimal.ZERO, null, null, BigDecimal.ZERO, null,
                                BigDecimal.ZERO, null, null);

                AssistanceRequest expectedSavedRequest = new AssistanceRequest();
                setPrivateField(expectedSavedRequest, "id", mockResponse.id());
                expectedSavedRequest.setTituloPublicacao("Título com Arquivo");
                expectedSavedRequest.setJustificativa("Justificativa com arquivo");
                expectedSavedRequest.setSituacao(0);
                expectedSavedRequest.setCartaAceite("newfile.pdf");
                User ownerEntity = new User();
                setPrivateField(ownerEntity, "id", mockUser.getId());
                ownerEntity.setEmail(mockUser.getEmail());
                expectedSavedRequest.setUser(ownerEntity);

                when(service.save(any(AssistanceRequest.class))).thenReturn(expectedSavedRequest);
                when(fileService.uploadPdf(any(MultipartFile.class))).thenReturn("newfile.pdf");

                MockMultipartFile formPart = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(requestBodyDto));
                MockMultipartFile pdfFile = new MockMultipartFile("file", "original.pdf",
                                MediaType.APPLICATION_PDF_VALUE, "pdf content".getBytes());

                mvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/assistancerequest/update")
                                .file(formPart)
                                .file(pdfFile)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.cartaAceite", is("newfile.pdf")));

                verify(service).save(any(AssistanceRequest.class));
                verify(fileService).uploadPdf(any(MultipartFile.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/update returns 404 when request not found")
        void update_shouldReturn404_whenRequestNotFound() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.findById(1L)).thenReturn(Optional.empty());

                ResponseAssistanceRequestDTO requestBodyDto = new ResponseAssistanceRequestDTO(
                                1L, null, null, null, "Qualquer", Collections.emptyList(), false, false, null, null,
                                false, 0, null, false, null, null, 1,  null, null, null, null, null,
                                BigDecimal.ZERO, null, 0, BigDecimal.ZERO, false, false, BigDecimal.ZERO,
                                BigDecimal.ZERO, BigDecimal.ZERO, null, null, false, 0,
                                null, null, null, 0, BigDecimal.ZERO, null, null, BigDecimal.ZERO, null,
                                BigDecimal.ZERO, null, null);

                MockMultipartFile formPart = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(requestBodyDto));

                mvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/assistancerequest/update")
                                .file(formPart)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isNotFound());

                verify(service, never()).save(any(AssistanceRequest.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/update returns 415 when file is not PDF")
        void update_shouldReturn415_whenFileNotPdf() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.findById(1L)).thenReturn(Optional.of(mockResponse));
                when(userService.findByEmail(mockUser.getEmail())).thenReturn(Optional.of(mockUser));

                when(fileService.uploadPdf(any(MultipartFile.class)))
                                .thenThrow(new IllegalArgumentException("Somente arquivos PDF são permitidos"));

                ResponseAssistanceRequestDTO requestBodyDto = new ResponseAssistanceRequestDTO(
                                1L, null, null, null, "Tentativa com TXT", Collections.emptyList(), false, false, null,
                                null,
                                false, 0, null, false, null, null, 1, null, null, null, null, null,
                                BigDecimal.ZERO, null, 0, BigDecimal.ZERO, false, false, BigDecimal.ZERO,
                                BigDecimal.ZERO, BigDecimal.ZERO, null, null, false, 0,
                                null, null, null, 0, BigDecimal.ZERO, null, null, BigDecimal.ZERO, null,
                                BigDecimal.ZERO, null, null);

                MockMultipartFile formPart = new MockMultipartFile("form", "", "application/json",
                                objectMapper.writeValueAsBytes(requestBodyDto));
                MockMultipartFile txtFile = new MockMultipartFile("file", "document.txt", MediaType.TEXT_PLAIN_VALUE,
                                "text content".getBytes());

                mvc.perform(MockMvcRequestBuilders.multipart(HttpMethod.PUT, "/api/assistancerequest/update")
                                .file(formPart)
                                .file(txtFile)
                                .contentType(MediaType.MULTIPART_FORM_DATA))
                                .andExpect(status().isUnsupportedMediaType());

                verify(service, never()).save(any(AssistanceRequest.class));
                verify(fileService).uploadPdf(any(MultipartFile.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/reviewsolicitation reviews request successfully")
        void reviewSolicitation_shouldReviewRequest() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.reviewSolicitation(any(AssistanceRequest.class), eq(mockUser)))
                                .thenReturn(mockRequest);

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/reviewsolicitation")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(mockRequest)))
                                .andExpect(status().isOk());

                verify(service).reviewSolicitation(any(AssistanceRequest.class), eq(mockUser));
        }

        @Test
        @DisplayName("PUT /assistancerequest/reviewsolicitation returns 400 when user not logged")
        void reviewSolicitation_shouldReturn400_whenNoUser() throws Exception {
                when(userService.getLoggedUser()).thenReturn(null);

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/reviewsolicitation")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(mockRequest)))
                                .andExpect(status().isBadRequest());

                verify(service, never()).reviewSolicitation(any(AssistanceRequest.class), any(User.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/reviewsolicitation returns 404 when request not found")
        void reviewSolicitation_shouldReturn404_whenRequestNotFound() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                when(service.reviewSolicitation(any(AssistanceRequest.class), eq(mockUser)))
                                .thenReturn(null);

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/reviewsolicitation")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(mockRequest)))
                                .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("DELETE /assistancerequest/remove/{id} removes request successfully")
        void remove_shouldRemoveRequest() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);
                doNothing().when(service).delete(1L);

                mvc.perform(MockMvcRequestBuilders.delete("/api/assistancerequest/remove/1"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.status", is("success")))
                                .andExpect(jsonPath("$.message", is("Successfully removed")));

                verify(service).delete(1L);
        }

        @Test
        @DisplayName("PUT /assistancerequest/approve/{requestId} approves request successfully")
        void approveRequest_shouldApproveRequest() throws Exception {
                when(userService.getLoggedUser()).thenReturn(adminUser);

                ReviewDTO reviewDTO = new ReviewDTO();
                reviewDTO.numeroAta = "123/2023";
                reviewDTO.numeroDiariasAprovadas = 3;
                reviewDTO.observacao = "Aprovado";

                Review approvedReview = new Review();
                setPrivateField(approvedReview, "id", 1L);

                when(reviewService.approve(any(ReviewDTO.class))).thenReturn(approvedReview);

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/approve/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(reviewDTO)))
                                .andExpect(status().isOk());

                verify(reviewService).approve(any(ReviewDTO.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/approve/{requestId} returns 400 when user not logged")
        void approveRequest_shouldReturn400_whenNoUser() throws Exception {
                when(userService.getLoggedUser()).thenReturn(null);

                ReviewDTO reviewDTO = new ReviewDTO();

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/approve/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(reviewDTO)))
                                .andExpect(status().isBadRequest());

                verify(reviewService, never()).approve(any(ReviewDTO.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/reprove/{requestId} reproves request successfully")
        void reproveRequest_shouldReproveRequest() throws Exception {
                when(userService.getLoggedUser()).thenReturn(adminUser);

                ReviewDTO reviewDTO = new ReviewDTO();
                reviewDTO.numeroAta = "123/2023";
                reviewDTO.observacao = "Reprovado por documentação incompleta";

                Review reprovedReview = new Review();
                setPrivateField(reprovedReview, "id", 1L);

                when(reviewService.reprove(any(ReviewDTO.class))).thenReturn(reprovedReview);

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/reprove/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(reviewDTO)))
                                .andExpect(status().isOk());

                verify(reviewService).reprove(any(ReviewDTO.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/{id}/ceapg updates CEAPG fields successfully")
        void updateCeapgFields_shouldUpdateSuccessfully() throws Exception {
                when(userService.getLoggedUser()).thenReturn(adminUser);

                AssistanceRequestCeapgDTO ceapgDTO = new AssistanceRequestCeapgDTO();
                ceapgDTO.setCustoFinalCeapg(BigDecimal.TEN);
                ceapgDTO.setObservacoesCeapg("Observações CEAPG");

                AssistanceRequest updatedRequest = new AssistanceRequest();
                setPrivateField(updatedRequest, "id", 1L);
                updatedRequest.setUser(mockUser);
                updatedRequest.setSituacao(1);
                updatedRequest.setCustoFinalCeapg(BigDecimal.TEN);
                updatedRequest.setObservacoesCeapg("Observações CEAPG");

                when(service.updateCeapgFields(eq(1L), any(AssistanceRequestCeapgDTO.class)))
                                .thenReturn(updatedRequest);

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/1/ceapg")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(ceapgDTO)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.id", is(1)))
                                .andExpect(jsonPath("$.custoFinalCeapg", is(10))) // Comparar como número
                                .andExpect(jsonPath("$.observacoesCeapg", is("Observações CEAPG")));

                verify(service).updateCeapgFields(eq(1L), any(AssistanceRequestCeapgDTO.class));
        }

        @Test
        @DisplayName("PUT /assistancerequest/{id}/ceapg returns 403 if user not authorized")
        void updateCeapgFields_shouldReturn403_whenNotAuthorized() throws Exception {
                when(userService.getLoggedUser()).thenReturn(mockUser);

                AssistanceRequestCeapgDTO ceapgDTO = new AssistanceRequestCeapgDTO();
                ceapgDTO.setCustoFinalCeapg(BigDecimal.TEN);
                ceapgDTO.setObservacoesCeapg("Observações CEAPG");

                when(service.updateCeapgFields(eq(1L), any(AssistanceRequestCeapgDTO.class)))
                                .thenThrow(new UnauthorizedException("User not authorized for CEAPG update."));

                mvc.perform(MockMvcRequestBuilders.put("/api/assistancerequest/1/ceapg")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(ceapgDTO)))
                                .andExpect(status().isForbidden())
                                .andExpect(jsonPath("$.message", is("User not authorized for CEAPG update.")));

                verify(service).updateCeapgFields(eq(1L), any(AssistanceRequestCeapgDTO.class));
        }
}
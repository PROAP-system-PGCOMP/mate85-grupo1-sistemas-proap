package br.ufba.proap.filestorage;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @GetMapping("view-pdf/{fileName}")
    public ResponseEntity<InputStreamResource> viewPdf(@PathVariable String fileName) {
        try {
            File pdfFile = fileService.getPdfByFileName(fileName);

            FileInputStream fis = new FileInputStream(pdfFile);
            InputStreamResource resource = new InputStreamResource(fis);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            headers.setContentDisposition(ContentDisposition.inline().filename(fileName).build());

            return ResponseEntity.ok().headers(headers).body(resource);

        } catch (FileNotFoundException e) {
            logger.error("Erro 404 - O Spring tentou buscar em: " + pdfFile.getAbsolutePath());
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

}

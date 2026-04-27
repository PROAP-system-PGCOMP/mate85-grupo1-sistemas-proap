package br.ufba.proap.filestorage;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Random;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileService {
    @Value("${file.upload-dir}")
    private String uploadDir;

    private static final String PDF_EXTENSION = ".pdf";

    private static final String PDF_DIRECTORY = "/pdf";

    public String uploadPdf(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        if (!isPdfFile(originalFileName)) {
            throw new IllegalArgumentException("Somente arquivos PDF são permitidos.");
        }

        String fileName = generateUniqueFileName() + PDF_EXTENSION;

        File directory = new File(uploadDir + PDF_DIRECTORY);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        File destFile = new File(directory, fileName);
        file.transferTo(destFile);

        return fileName;
    }

    private boolean isPdfFile(String filename) {
        return (filename != null && filename.toLowerCase().endsWith(PDF_EXTENSION));
    }

    private String generateUniqueFileName() {
        long timestamp = System.currentTimeMillis();
        int randomInt = new Random().nextInt(1000);

        return (randomInt + "" + timestamp + "" + randomInt);
    }

    public File getPdfByFileName(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir, PDF_DIRECTORY, fileName);
        File file = filePath.toFile();

        logger.info("DPROJ DEBUG - Tentando acessar arquivo em: {}", file.getAbsolutePath());

        if (!file.exists() || !file.isFile()) {
            logger.error("DPROJ DEBUG - Arquivo não existe no caminho: {}", file.getAbsolutePath());
            throw new FileNotFoundException("Arquivo \"" + fileName + "\" não encontrado no servidor.");
        }

        return file;
    }

    @jakarta.annotation.PostConstruct
    public void logDir() {
        System.out.println("=========================================");
        System.out.println("DPROJ DEBUG - DIRETÓRIO DE UPLOAD: " + uploadDir);
        System.out.println("=========================================");
    }
}

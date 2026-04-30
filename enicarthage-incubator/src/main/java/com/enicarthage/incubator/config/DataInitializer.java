package com.enicarthage.incubator.config;

import com.enicarthage.incubator.model.Role;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Créer un admin par défaut s'il n'existe pas
        if (!userRepository.existsByEmail("admin@enicarthage.tn")) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("Enicarthage")
                    .email("admin@enicarthage.tn")
                    .password(passwordEncoder.encode("Admin@2024"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .blocked(false)
                    .build();
            userRepository.save(admin);
            log.info("✅ Compte admin créé : admin@enicarthage.tn / Admin@2024");
        }

        // Créer un évaluateur par défaut
        if (!userRepository.existsByEmail("evaluateur@enicarthage.tn")) {
            User evaluator = User.builder()
                    .firstName("Evaluateur")
                    .lastName("Incubator")
                    .email("evaluateur@enicarthage.tn")
                    .password(passwordEncoder.encode("Eval@2024"))
                    .role(Role.EVALUATOR)
                    .enabled(true)
                    .blocked(false)
                    .build();
            userRepository.save(evaluator);
            log.info("✅ Compte évaluateur créé : evaluateur@enicarthage.tn / Eval@2024");
        }

        // Créer un étudiant de test
        User student = null;
        if (!userRepository.existsByEmail("etudiant@enicarthage.tn")) {
            student = User.builder()
                    .firstName("Ahmed")
                    .lastName("Ben Ali")
                    .email("etudiant@enicarthage.tn")
                    .password(passwordEncoder.encode("Student@2024"))
                    .role(Role.STUDENT)
                    .specialty("Génie Informatique")
                    .skills("Java, Spring Boot, React")
                    .enabled(true)
                    .blocked(false)
                    .build();
            student = userRepository.save(student);
            log.info("✅ Compte étudiant créé : etudiant@enicarthage.tn / Student@2024");
        } else {
            student = userRepository.findByEmail("etudiant@enicarthage.tn").orElse(null);
        }

        // NOTE: Si vous avez des repositories pour Project et Program, vous pourriez injecter 
        // ProjectRepository et ProgramRepository dans DataInitializer et ajouter :
        /*
        if (student != null && projectRepository.count() == 0) {
            Project p1 = Project.builder().title("Plateforme E-learning").description("Une plateforme pour les cours en ligne").status(ProjectStatus.SUBMITTED).student(student).build();
            Project p2 = Project.builder().title("Smart Agriculture").description("IoT pour l'agriculture").status(ProjectStatus.ACCEPTED).student(student).build();
            projectRepository.saveAll(List.of(p1, p2));
            log.info("✅ Projets de test créés");
        }
        */
    }
}

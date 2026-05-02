package com.enicarthage.incubator.service;

import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Role;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.enicarthage.incubator.exception.EmailAlreadyExistsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + id));
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable : " + email));
    }

    public User updateProfile(String email, User updatedData) {
        User user = getUserByEmail(email);
        user.setFirstName(updatedData.getFirstName());
        user.setLastName(updatedData.getLastName());
        user.setPhone(updatedData.getPhone());
        user.setSpecialty(updatedData.getSpecialty());
        user.setSkills(updatedData.getSkills());
        user.setBio(updatedData.getBio());
        return userRepository.save(user);
    }

    public User toggleBlockUser(Long userId) {
        User user = getUserById(userId);
        user.setBlocked(!user.isBlocked());
        return userRepository.save(user);
    }

    public User changeRole(Long userId, Role newRole) {
        User user = getUserById(userId);
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    public User inviteEvaluator(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException("Un utilisateur avec cet email existe déjà.");
        }

        String tempPassword = UUID.randomUUID().toString().substring(0, 8); // e.g., "a1b2c3d4"

        User evaluator = User.builder()
                .email(email)
                .firstName("Évaluateur")
                .lastName("Invité")
                .password(passwordEncoder.encode(tempPassword))
                .role(Role.EVALUATOR)
                .firstLogin(true)
                .build();

        userRepository.save(evaluator);
        System.out.println("=========================================================");
        System.out.println("NOUVEL ÉVALUATEUR INVITÉ !");
        System.out.println("Email : " + email);
        System.out.println("Mot de passe temporaire : " + tempPassword);
        System.out.println("=========================================================");
        emailService.sendEvaluatorInvitation(email, tempPassword);
        return evaluator;
    }

    public User completeFirstLogin(String email, String newPassword, String firstName, String lastName, String specialty) {
        User user = getUserByEmail(email);
        if (!user.isFirstLogin()) {
            throw new IllegalStateException("Le profil a déjà été complété.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        if (specialty != null && !specialty.isBlank()) {
            user.setSpecialty(specialty);
        }
        user.setFirstLogin(false);
        return userRepository.save(user);
    }
}

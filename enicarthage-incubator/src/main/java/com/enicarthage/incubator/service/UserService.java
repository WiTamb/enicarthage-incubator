package com.enicarthage.incubator.service;

import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Role;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

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
}

package com.enicarthage.incubator.controller;

import com.enicarthage.incubator.dto.response.ApiResponse;
import com.enicarthage.incubator.model.Role;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.enicarthage.incubator.dto.request.InviteRequest;
import com.enicarthage.incubator.dto.request.CompleteProfileRequest;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // --- Profil connecté ---
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Profil récupéré", user));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<User>> updateMyProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody User updatedData) {
        User updated = userService.updateProfile(userDetails.getUsername(), updatedData);
        return ResponseEntity.ok(ApiResponse.success("Profil mis à jour", updated));
    }

    @PutMapping("/users/complete-profile")
    public ResponseEntity<ApiResponse<User>> completeProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CompleteProfileRequest request) {
        User user = userService.completeFirstLogin(
                userDetails.getUsername(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName(),
                request.getSpecialty()
        );
        return ResponseEntity.ok(ApiResponse.success("Profil complété avec succès", user));
    }

    // --- Admin : gestion des utilisateurs ---
    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success("Liste des utilisateurs", userService.getAllUsers()));
    }

    @PostMapping("/admin/evaluators/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> inviteEvaluator(@Valid @RequestBody InviteRequest request) {
        User evaluator = userService.inviteEvaluator(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Évaluateur invité avec succès", evaluator));
    }

    @GetMapping("/evaluators")
    @PreAuthorize("hasAnyRole('ADMIN', 'EVALUATOR')")
    public ResponseEntity<ApiResponse<List<User>>> getEvaluators() {
        List<User> evaluators = userService.getAllUsers().stream()
                .filter(u -> u.getRole() == Role.EVALUATOR || u.getRole() == Role.ADMIN)
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Liste des évaluateurs", evaluators));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Utilisateur trouvé", userService.getUserById(id)));
    }

    @PatchMapping("/admin/users/{id}/toggle-block")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleBlock(@PathVariable Long id) {
        User user = userService.toggleBlockUser(id);
        String msg = user.isBlocked() ? "Utilisateur bloqué" : "Utilisateur débloqué";
        return ResponseEntity.ok(ApiResponse.success(msg, user));
    }

    @PatchMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> changeRole(
            @PathVariable Long id,
            @RequestParam Role role) {
        User user = userService.changeRole(id, role);
        return ResponseEntity.ok(ApiResponse.success("Rôle mis à jour", user));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("Utilisateur supprimé", null));
    }
}

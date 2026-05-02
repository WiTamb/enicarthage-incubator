package com.enicarthage.incubator.service;

import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Event;
import com.enicarthage.incubator.model.EventRegistration;
import com.enicarthage.incubator.model.User;
import com.enicarthage.incubator.repository.EventRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final EventService eventService;
    private final UserService userService;

    public EventRegistration registerForEvent(Long eventId, Long userId) {
        Event event = eventService.getEventById(eventId);
        
        if (!event.isRegistrationEnabled()) {
            throw new IllegalStateException("Les inscriptions ne sont pas ouvertes pour cet événement.");
        }

        if (event.getMaxParticipants() != null) {
            long currentParticipants = registrationRepository.countByEventId(eventId);
            if (currentParticipants >= event.getMaxParticipants()) {
                throw new IllegalStateException("L'événement est complet.");
            }
        }

        if (registrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new IllegalStateException("Vous êtes déjà inscrit à cet événement.");
        }

        User user = userService.getUserById(userId);

        EventRegistration registration = EventRegistration.builder()
                .event(event)
                .user(user)
                .build();

        return registrationRepository.save(registration);
    }

    public List<EventRegistration> getParticipantsByEvent(Long eventId) {
        return registrationRepository.findByEventId(eventId);
    }

    public boolean isRegistered(Long eventId, Long userId) {
        return registrationRepository.existsByEventIdAndUserId(eventId, userId);
    }

    public long getParticipantCount(Long eventId) {
        return registrationRepository.countByEventId(eventId);
    }
}

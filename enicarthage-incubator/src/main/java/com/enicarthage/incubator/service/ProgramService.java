package com.enicarthage.incubator.service;

import com.enicarthage.incubator.exception.ResourceNotFoundException;
import com.enicarthage.incubator.model.Program;
import com.enicarthage.incubator.model.Round;
import com.enicarthage.incubator.repository.ProgramRepository;
import com.enicarthage.incubator.repository.RoundRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final RoundRepository roundRepository;

    public List<Program> getAllPrograms() {
        return programRepository.findAll();
    }

    public List<Program> getActivePrograms() {
        return programRepository.findByActive(true);
    }

    public Program getProgramById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Programme introuvable : " + id));
    }

    public Program createProgram(Program program) {
        return programRepository.save(program);
    }

    public Program updateProgram(Long id, Program updatedData) {
        Program program = getProgramById(id);
        program.setName(updatedData.getName());
        program.setDescription(updatedData.getDescription());
        program.setStartDate(updatedData.getStartDate());
        program.setEndDate(updatedData.getEndDate());
        program.setActive(updatedData.isActive());
        return programRepository.save(program);
    }

    public void deleteProgram(Long id) {
        programRepository.deleteById(id);
    }

    // --- Rounds ---
    public List<Round> getRoundsByProgram(Long programId) {
        return roundRepository.findByProgramId(programId);
    }

    public Round createRound(Round round) {
        return roundRepository.save(round);
    }

    public Round updateRound(Long id, Round updatedData) {
        Round round = roundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Round introuvable : " + id));
        round.setName(updatedData.getName());
        round.setDescription(updatedData.getDescription());
        round.setRoundNumber(updatedData.getRoundNumber());
        round.setDeadline(updatedData.getDeadline());
        round.setActive(updatedData.isActive());
        return roundRepository.save(round);
    }

    public void deleteRound(Long id) {
        roundRepository.deleteById(id);
    }
}

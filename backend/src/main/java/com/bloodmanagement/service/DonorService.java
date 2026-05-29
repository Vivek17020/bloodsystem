package com.bloodmanagement.service;

import com.bloodmanagement.dto.DonorDto;
import com.bloodmanagement.entity.BloodType;
import com.bloodmanagement.entity.Donor;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.exception.ResourceNotFoundException;
import com.bloodmanagement.repository.DonorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Donor management service.
 */
@Service
public class DonorService {

    @Autowired private DonorRepository donorRepository;

    public List<DonorDto> getAll() {
        return donorRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public DonorDto getById(Long id) {
        return toDto(donorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Donor", id)));
    }

    public DonorDto getByUser(User user) {
        return toDto(donorRepository.findByUser(user)
            .orElseThrow(() -> new ResourceNotFoundException("Donor profile not found for user: " + user.getUsername())));
    }

    public List<DonorDto> getEligible(BloodType bloodType) {
        List<Donor> donors = bloodType != null
            ? donorRepository.findByEligibleTrueAndBloodType(bloodType)
            : donorRepository.findByEligibleTrue();
        return donors.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public DonorDto update(Long id, DonorDto dto) {
        Donor donor = donorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Donor", id));
        if (dto.getAddress() != null) donor.setAddress(dto.getAddress());
        if (dto.getCity() != null) donor.setCity(dto.getCity());
        if (dto.getPhone() != null) donor.getUser().setPhone(dto.getPhone());
        if (dto.getWeight() != null) donor.setWeight(dto.getWeight());
        return toDto(donorRepository.save(donor));
    }

    public Map<String, Object> checkEligibility(Long id) {
        Donor donor = donorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Donor", id));
        boolean eligible = donor.isEligible();
        String reason = null;
        if (!eligible && donor.getNextEligibleDate() != null) {
            reason = "Next eligible date: " + donor.getNextEligibleDate();
        }
        return Map.of("eligible", eligible, "reason", reason != null ? reason : "");
    }

    public Map<String, Long> getStats() {
        return Map.of(
            "totalDonors", donorRepository.count(),
            "activeDonors", donorRepository.countActiveDonors(),
            "todayDonations", 0L,
            "monthlyDonations", 0L
        );
    }

    private DonorDto toDto(Donor d) {
        DonorDto dto = new DonorDto();
        dto.setId(d.getId());
        dto.setUserId(d.getUser().getId());
        dto.setFirstName(d.getUser().getFirstName());
        dto.setLastName(d.getUser().getLastName());
        dto.setEmail(d.getUser().getEmail());
        dto.setPhone(d.getUser().getPhone());
        dto.setBloodType(d.getBloodType());
        dto.setDateOfBirth(d.getDateOfBirth());
        dto.setGender(d.getGender());
        dto.setAddress(d.getAddress());
        dto.setCity(d.getCity());
        dto.setWeight(d.getWeight());
        dto.setEligible(d.isEligible());
        dto.setLastDonationDate(d.getLastDonationDate());
        dto.setNextEligibleDate(d.getNextEligibleDate());
        dto.setTotalDonations(d.getTotalDonations());
        dto.setStatus(d.getStatus());
        return dto;
    }
}

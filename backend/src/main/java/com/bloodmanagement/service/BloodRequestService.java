package com.bloodmanagement.service;

import com.bloodmanagement.dto.BloodRequestDto;
import com.bloodmanagement.entity.BloodRequest;
import com.bloodmanagement.entity.BloodRequest.RequestStatus;
import com.bloodmanagement.entity.BloodRequest.UrgencyLevel;
import com.bloodmanagement.entity.User;
import com.bloodmanagement.exception.BadRequestException;
import com.bloodmanagement.exception.ResourceNotFoundException;
import com.bloodmanagement.repository.BloodRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Blood request workflow service — create, approve, reject, cancel.
 */
@Service
public class BloodRequestService {

    @Autowired private BloodRequestRepository requestRepository;
    @Autowired private NotificationService notificationService;

    public List<BloodRequestDto> getAll() {
        return requestRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BloodRequestDto> getByStatus(RequestStatus status) {
        return requestRepository.findByStatus(status).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BloodRequestDto> getByUser(User user) {
        return requestRepository.findByRequesterOrderByRequestDateDesc(user).stream()
            .map(this::toDto).collect(Collectors.toList());
    }

    public BloodRequestDto getById(Long id) {
        return toDto(requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BloodRequest", id)));
    }

    public List<BloodRequestDto> getEmergencyRequests() {
        return requestRepository.findEmergencyRequests().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public BloodRequestDto create(BloodRequestDto dto, User requester) {
        BloodRequest request = BloodRequest.builder()
            .requester(requester)
            .bloodType(dto.getBloodType())
            .units(dto.getUnits())
            .urgency(dto.getUrgency() != null ? dto.getUrgency() : UrgencyLevel.NORMAL)
            .status(RequestStatus.PENDING)
            .reason(dto.getReason())
            .patientName(dto.getPatientName())
            .contactPhone(dto.getContactPhone())
            .requiredByDate(dto.getRequiredByDate())
            .notes(dto.getNotes())
            .build();

        BloodRequest saved = requestRepository.save(request);

        if (saved.getUrgency() == UrgencyLevel.CRITICAL) {
            notificationService.notifyAdminsAndBloodBanks(
                "Critical Blood Request",
                requester.getUsername() + " submitted a CRITICAL request for " +
                    dto.getBloodType().getDisplayName() + " — " + dto.getUnits() + " units"
            );
        }

        return toDto(saved);
    }

    @Transactional
    public BloodRequestDto approve(Long id, String notes, User approver) {
        BloodRequest request = requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BloodRequest", id));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be approved.");
        }

        request.setStatus(RequestStatus.APPROVED);
        request.setApprovedDate(LocalDateTime.now());
        request.setApprovedBy(approver);
        if (notes != null) request.setNotes(notes);

        BloodRequest saved = requestRepository.save(request);

        notificationService.createNotification(
            request.getRequester(),
            "Blood Request Approved",
            "Your blood request (#" + id + ") for " + request.getBloodType().getDisplayName() + " has been approved.",
            com.bloodmanagement.entity.Notification.NotificationType.REQUEST_APPROVED,
            id, "BloodRequest"
        );

        return toDto(saved);
    }

    @Transactional
    public BloodRequestDto reject(Long id, String reason, User approver) {
        BloodRequest request = requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BloodRequest", id));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be rejected.");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setApprovedBy(approver);
        request.setNotes(reason);

        BloodRequest saved = requestRepository.save(request);

        notificationService.createNotification(
            request.getRequester(),
            "Blood Request Rejected",
            "Your blood request (#" + id + ") was rejected. Reason: " + reason,
            com.bloodmanagement.entity.Notification.NotificationType.REQUEST_REJECTED,
            id, "BloodRequest"
        );

        return toDto(saved);
    }

    @Transactional
    public BloodRequestDto cancel(Long id, User user) {
        BloodRequest request = requestRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("BloodRequest", id));

        if (!request.getRequester().getId().equals(user.getId())) {
            throw new BadRequestException("You can only cancel your own requests.");
        }
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new BadRequestException("Only pending requests can be cancelled.");
        }

        request.setStatus(RequestStatus.CANCELLED);
        return toDto(requestRepository.save(request));
    }

    public Map<String, Long> getStats() {
        return Map.of(
            "pending",  requestRepository.countByStatus(RequestStatus.PENDING),
            "approved", requestRepository.countByStatus(RequestStatus.APPROVED),
            "critical", requestRepository.countByUrgency(UrgencyLevel.CRITICAL),
            "fulfilled", requestRepository.countByStatus(RequestStatus.FULFILLED)
        );
    }

    private BloodRequestDto toDto(BloodRequest r) {
        BloodRequestDto dto = new BloodRequestDto();
        dto.setId(r.getId());
        dto.setRequesterId(r.getRequester().getId());
        dto.setRequesterName(r.getRequester().getUsername());
        dto.setRequesterType(r.getRequester().getRole().name());
        dto.setBloodType(r.getBloodType());
        dto.setUnits(r.getUnits());
        dto.setUrgency(r.getUrgency());
        dto.setStatus(r.getStatus());
        dto.setReason(r.getReason());
        dto.setPatientName(r.getPatientName());
        dto.setContactPhone(r.getContactPhone());
        dto.setRequiredByDate(r.getRequiredByDate());
        dto.setRequestDate(r.getRequestDate());
        dto.setApprovedDate(r.getApprovedDate());
        if (r.getApprovedBy() != null) dto.setApprovedById(r.getApprovedBy().getId());
        dto.setNotes(r.getNotes());
        return dto;
    }
}

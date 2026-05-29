package com.bloodmanagement.repository;

import com.bloodmanagement.entity.BloodRequest;
import com.bloodmanagement.entity.BloodRequest.RequestStatus;
import com.bloodmanagement.entity.BloodRequest.UrgencyLevel;
import com.bloodmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    List<BloodRequest> findByRequester(User requester);
    List<BloodRequest> findByStatus(RequestStatus status);
    List<BloodRequest> findByUrgencyIn(List<UrgencyLevel> urgencies);
    List<BloodRequest> findByRequesterOrderByRequestDateDesc(User requester);

    @Query("SELECT r FROM BloodRequest r WHERE r.urgency IN ('CRITICAL','URGENT') AND r.status = 'PENDING' ORDER BY r.urgency DESC, r.requestDate ASC")
    List<BloodRequest> findEmergencyRequests();

    long countByStatus(RequestStatus status);
    long countByUrgency(UrgencyLevel urgency);
}

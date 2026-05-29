package com.bloodmanagement.repository;

import com.bloodmanagement.entity.Hospital;
import com.bloodmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {
    Optional<Hospital> findByUser(User user);
    Optional<Hospital> findByUserId(Long userId);
    List<Hospital> findByActiveTrue();
}

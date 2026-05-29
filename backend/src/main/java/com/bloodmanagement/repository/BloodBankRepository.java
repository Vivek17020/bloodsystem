package com.bloodmanagement.repository;

import com.bloodmanagement.entity.BloodBank;
import com.bloodmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BloodBankRepository extends JpaRepository<BloodBank, Long> {
    Optional<BloodBank> findByUser(User user);
    Optional<BloodBank> findByUserId(Long userId);
    List<BloodBank> findByActiveTrue();
}

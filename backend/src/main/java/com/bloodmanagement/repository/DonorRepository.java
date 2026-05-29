package com.bloodmanagement.repository;

import com.bloodmanagement.entity.BloodType;
import com.bloodmanagement.entity.Donor;
import com.bloodmanagement.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {
    Optional<Donor> findByUser(User user);
    Optional<Donor> findByUserId(Long userId);
    List<Donor> findByBloodType(BloodType bloodType);
    List<Donor> findByEligibleTrue();
    List<Donor> findByEligibleTrueAndBloodType(BloodType bloodType);

    @Query("SELECT COUNT(d) FROM Donor d WHERE d.status = 'ACTIVE'")
    long countActiveDonors();
}

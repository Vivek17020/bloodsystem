package com.bloodmanagement.repository;

import com.bloodmanagement.entity.BloodInventory;
import com.bloodmanagement.entity.BloodInventory.InventoryStatus;
import com.bloodmanagement.entity.BloodType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BloodInventoryRepository extends JpaRepository<BloodInventory, Long> {

    List<BloodInventory> findByBloodType(BloodType bloodType);
    List<BloodInventory> findByStatus(InventoryStatus status);
    List<BloodInventory> findByBloodBankId(Long bloodBankId);
    List<BloodInventory> findByBloodTypeAndStatus(BloodType bloodType, InventoryStatus status);

    @Query("SELECT b FROM BloodInventory b WHERE b.expiryDate <= :expiry AND b.status = 'AVAILABLE'")
    List<BloodInventory> findExpiringSoon(@Param("expiry") LocalDate expiry);

    @Query("SELECT b.bloodType, SUM(b.units) FROM BloodInventory b WHERE b.status = 'AVAILABLE' GROUP BY b.bloodType")
    List<Object[]> getAvailableUnitsByBloodType();

    @Query("SELECT SUM(b.units) FROM BloodInventory b WHERE b.bloodType = :bt AND b.status = 'AVAILABLE'")
    Integer sumAvailableUnitsByBloodType(@Param("bt") BloodType bloodType);
}

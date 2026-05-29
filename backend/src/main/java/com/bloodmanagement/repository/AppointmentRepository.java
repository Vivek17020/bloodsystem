package com.bloodmanagement.repository;

import com.bloodmanagement.entity.Appointment;
import com.bloodmanagement.entity.Appointment.AppointmentStatus;
import com.bloodmanagement.entity.Donor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByDonorOrderByScheduledDateDesc(Donor donor);
    List<Appointment> findByBloodBankId(Long bloodBankId);
    List<Appointment> findByStatus(AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.donor = :donor AND a.scheduledDate >= :today AND a.status NOT IN ('CANCELLED','COMPLETED') ORDER BY a.scheduledDate ASC")
    List<Appointment> findUpcomingByDonor(@Param("donor") Donor donor, @Param("today") LocalDate today);
}

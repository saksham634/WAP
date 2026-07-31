package com.wap.repository;

import com.wap.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // The underscore tells Spring to look inside the 'user' object for its 'id'
    Optional<Attendance> findByUser_IdAndRecordDate(Long userId, LocalDate recordDate);

    // Calculate total days present in a specific month and year
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.user.id = :userId AND MONTH(a.recordDate) = :month AND YEAR(a.recordDate) = :year")
    int countPresentDaysByMonthAndYear(@Param("userId") Long userId, 
                                       @Param("month") int month, 
                                       @Param("year") int year);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.recordDate = :date AND a.status IN ('PRESENT', 'HALF_DAY')")
    long countPresentByDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.user.organization.id = :orgId AND a.recordDate = :date AND a.status IN ('PRESENT', 'HALF_DAY')")
    long countPresentByOrganization_IdAndDate(@Param("orgId") Long orgId, @Param("date") LocalDate date);

    java.util.List<Attendance> findByUser_Organization_IdAndRecordDate(Long orgId, LocalDate recordDate);
}
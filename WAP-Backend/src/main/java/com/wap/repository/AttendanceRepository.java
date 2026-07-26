package com.wap.repository;

import com.wap.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    
    // The underscore tells Spring to look inside the 'user' object for its 'id'
    Optional<Attendance> findByUser_IdAndRecordDate(Long userId, LocalDate recordDate);
 // Calculate total days present in a specific month and year
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Attendance a WHERE a.user.id = :userId AND MONTH(a.recordDate) = :month AND YEAR(a.recordDate) = :year")
    int countPresentDaysByMonthAndYear(@org.springframework.data.repository.query.Param("userId") Long userId, 
                                       @org.springframework.data.repository.query.Param("month") int month, 
                                       @org.springframework.data.repository.query.Param("year") int year);
}
package com.devonfw.application.mtsj.bookingmanagement.dataaccess.api.repo;

import static com.querydsl.core.alias.Alias.$;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import javax.persistence.EntityManager;
import javax.persistence.QueryHint;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import com.devonfw.application.mtsj.bookingmanagement.common.api.datatype.BookingType;
import com.devonfw.application.mtsj.bookingmanagement.common.api.to.BookingEto;
import com.devonfw.application.mtsj.bookingmanagement.common.api.to.BookingSearchCriteriaTo;
import com.devonfw.application.mtsj.bookingmanagement.dataaccess.api.BookingEntity;
import com.devonfw.application.mtsj.bookingmanagement.dataaccess.api.TableEntity;
import com.devonfw.application.mtsj.ordermanagement.dataaccess.api.OrderLineEntity;
import com.devonfw.application.mtsj.usermanagement.dataaccess.api.UserEntity;
import com.devonfw.module.jpa.dataaccess.api.QueryUtil;
import com.devonfw.module.jpa.dataaccess.api.data.DefaultRepository;
import com.querydsl.core.alias.Alias;
import com.querydsl.jpa.impl.JPAQuery;
import com.sap.db.jdbc.Session;

/**
 * {@link DefaultRepository} for {@link BookingEntity}.
 */
public interface BookingRepository extends DefaultRepository<BookingEntity> {

	/**
	 * @param pageable, date, table
	 * @return the Page of {@link BookingEntity} objects that matched the search.
	 */
	@Query("SELECT booking FROM BookingEntity booking" //
			+ " WHERE booking.bookingDate < :date" //
			+ " AND booking.table = :table" //
			+ " ORDER BY booking.bookingDate DESC")
	Page<BookingEntity> findClosestBooking(Pageable pageable, @Param("date") Instant date,
			@Param("table") TableEntity table);

	/**
	 * @param table
	 * @return the {@link BookingEntity} objects that matched the search.
	 */
	@Query("SELECT booking FROM BookingEntity booking" //
			+ " WHERE booking.table = :table")
	List<BookingEntity> findBookingByTable(@Param("table") TableEntity table);

	/**
	 * @param host
	 * @return the List of {@link BookingEntity} objects that matched the search.
	 */
	@Query("SELECT booking FROM BookingEntity booking" //
			+ " WHERE booking.user = :host")
	List<BookingEntity> findBookingByHostId(@Param("host") UserEntity host);

	/**
	 * @param token
	 * @return the {@link BookingEntity} objects that matched the search.
	 */
	@Query("SELECT booking FROM BookingEntity booking" //
			+ " WHERE booking.bookingToken = :token")
	BookingEntity findBookingByToken(@Param("token") String token);

	/**
	 * @param criteria the {@link BookingSearchCriteriaTo} with the criteria to
	 *                 search.
	 * @return the {@link Page} of the {@link BookingEntity} objects that matched
	 *         the search.
	 */
	default Page<BookingEntity> findBookings(BookingSearchCriteriaTo criteria) {

		BookingEntity alias = newDslAlias();
		JPAQuery<BookingEntity> query = newDslQuery(alias);

		String name = criteria.getName();
		if ((name != null) && !name.isEmpty()) {
			QueryUtil.get().whereString(query, $(alias.getName()), name, criteria.getNameOption());
		}
		String bookingToken = criteria.getBookingToken();
		if (bookingToken != null && !bookingToken.isEmpty()) {
			QueryUtil.get().whereString(query, $(alias.getBookingToken()), bookingToken,
					criteria.getBookingTokenOption());
		}
		String comment = criteria.getComment();
		if (comment != null && !comment.isEmpty()) {
			QueryUtil.get().whereString(query, $(alias.getComment()), comment, criteria.getCommentOption());
		}
		
		Instant bookingDate = criteria.getBookingDate();
		if (bookingDate != null ) {
			query.where(Alias.$(alias.getBookingDate()).eq(bookingDate));
		}
		
		Instant expirationDate = criteria.getExpirationDate();
		if (expirationDate != null) {
			query.where(Alias.$(alias.getExpirationDate()).eq(expirationDate));
		}
		Instant creationDate = criteria.getCreationDate();
		if (creationDate != null) {
			query.where(Alias.$(alias.getCreationDate()).eq(creationDate));
		}
		String email = criteria.getEmail();
		if (email != null && !email.isEmpty()) {
			QueryUtil.get().whereString(query, $(alias.getEmail()), email, criteria.getEmailOption());

		}
		Boolean canceled = criteria.getCanceled();
		if (canceled != null) {
			query.where(Alias.$(alias.getCanceled()).eq(canceled));
		}

		BookingType bookingType = criteria.getBookingType();
		if (bookingType != null) {
			query.where(Alias.$(alias.getBookingType()).eq(bookingType));
		}
		Long table = criteria.getTableId();
		if (table != null && alias.getTable() != null) {
			query.where(Alias.$(alias.getTable().getId()).eq(table));
		}
		return QueryUtil.get().findPaginated(criteria.getPageable(), query, true);
	}
}

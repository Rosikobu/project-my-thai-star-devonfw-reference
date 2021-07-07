package com.devonfw.application.mtsj.bookingmanagement.common.api.to;

import java.time.Instant;

import javax.validation.constraints.Future;
import javax.validation.constraints.NotNull;

import com.devonfw.module.basic.common.api.to.AbstractCto;

/**
 * Composite transport object of findBy
 */
public class findByCto extends AbstractCto {

	private static final long serialVersionUID = 1L;

	@NotNull
	private Instant bookingDate;

	@NotNull
	private Long tableId;

	/**
	 * @return bookingDate
	 */
	public Instant getBookingDate() {
		return bookingDate;
	}

	/**
	 * @param bookingDate new value of {@link #getBookingDate}.
	 */
	public void setBookingDate(Instant bookingDate) {
		this.bookingDate = bookingDate;
	}

	/**
	 * @return delivery
	 */
	public Long getTableId() {
		return tableId;
	}

	/**
	 * @param tableId new value of {@link #getTableId}.
	 */
	public void setTableId(Long tableId) {
		this.tableId = tableId;
	}

}

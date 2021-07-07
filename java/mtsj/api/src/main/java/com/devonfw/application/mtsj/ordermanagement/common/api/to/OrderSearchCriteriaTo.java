package com.devonfw.application.mtsj.ordermanagement.common.api.to;

import java.time.Instant;

import com.devonfw.application.mtsj.general.common.api.to.AbstractSearchCriteriaTo;
import com.devonfw.module.basic.common.api.query.StringSearchConfigTo;

/**
 * used to find
 * {@link com.devonfw.application.mtsj.ordermanagement.common.api.Order}s.
 */
public class OrderSearchCriteriaTo extends AbstractSearchCriteriaTo {

	private static final long serialVersionUID = 1L;

	private Long bookingId;

	private Long invitedGuestId;

	private String hostToken;

	private Long hostId;

	private Long tableId;

	private String email;

	private Integer status;

	private boolean archived;

	private boolean canceled;

	private Boolean paid;

	private String bookingToken;

	private Instant bookingDate;

	private StringSearchConfigTo hostTokenOption;

	private StringSearchConfigTo emailOption;

	private StringSearchConfigTo bookingTokenOption;

	private StringSearchConfigTo archivedOption;

	/**
	 * The constructor.
	 */
	public OrderSearchCriteriaTo() {

		super();
	}

	public Long getBookingId() {

		return this.bookingId;
	}

	public void setBookingId(Long bookingId) {

		this.bookingId = bookingId;
	}

	public boolean isCanceled() {

		return this.canceled;
	}

	public void setCanceled(boolean canceled) {

		this.canceled = canceled;
	}

	public Long getInvitedGuestId() {

		return this.invitedGuestId;
	}

	public void setInvitedGuestId(Long invitedGuestId) {

		this.invitedGuestId = invitedGuestId;
	}

	public String getHostToken() {

		return this.hostToken;
	}

	public void setHostToken(String hostToken) {

		this.hostToken = hostToken;
	}

	public Long getHostId() {

		return this.hostId;
	}

	public void setHostId(Long hostId) {

		this.hostId = hostId;
	}

	public Long getTableId() {

		return this.tableId;
	}

	public void setTableId(Long tableId) {

		this.hostId = tableId;
	}

	/**
	 * @return email
	 */
	public String getEmail() {

		return this.email;
	}

	/**
	 * @param email new value of {@link #getEmail}.
	 */
	public void setEmail(String email) {

		this.email = email;
	}

	public void setArchived(boolean archived) {

		this.archived = archived;
	}

	public boolean getArchived() {

		return this.archived;
	}

	public Integer getStatus() {

		return this.status;
	}

	public void setStatus(Integer status) {

		this.status = status;
	}

	/**
	 * @return bookingToken
	 */
	public String getBookingToken() {

		return this.bookingToken;
	}

	/**
	 * @param bookingToken new value of {@link #getBookingToken}.
	 */
	public void setBookingToken(String bookingToken) {

		this.bookingToken = bookingToken;
	}

	/**
	 * @return hostTokenOption
	 */
	public StringSearchConfigTo getHostTokenOption() {

		return this.hostTokenOption;
	}

	/**
	 * @param hostTokenOption new value of {@link #gethostTokenOption}.
	 */
	public void setHostTokenOption(StringSearchConfigTo hostTokenOption) {

		this.hostTokenOption = hostTokenOption;
	}

	/**
	 * @return emailOption
	 */
	public StringSearchConfigTo getEmailOption() {

		return this.emailOption;
	}

	/**
	 * @param emailOption new value of {@link #getemailOption}.
	 */
	public void setEmailOption(StringSearchConfigTo emailOption) {

		this.emailOption = emailOption;
	}

	/**
	 * @return bookingTokenOption
	 */
	public StringSearchConfigTo getBookingTokenOption() {

		return this.bookingTokenOption;
	}

	/**
	 * @param bookingTokenOption new value of {@link #getbookingTokenOption}.
	 */
	public void setBookingTokenOption(StringSearchConfigTo bookingTokenOption) {

		this.bookingTokenOption = bookingTokenOption;
	}

	public StringSearchConfigTo getArchivedOption() {

		return this.archivedOption;
	}

	public void setArchivedOption(StringSearchConfigTo archivedOption) {

		this.archivedOption = archivedOption;
	}

	public Boolean getPaid() {

		return this.paid;
	}

	public void setBookingDate(Instant bookingDate) {

		this.bookingDate = bookingDate;
	}

	public Instant getBookingDate() {

		return this.bookingDate;
	}

}

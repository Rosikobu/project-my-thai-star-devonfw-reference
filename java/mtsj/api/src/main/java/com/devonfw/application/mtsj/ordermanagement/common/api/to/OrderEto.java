package com.devonfw.application.mtsj.ordermanagement.common.api.to;

import java.util.stream.IntStream;
import com.devonfw.application.mtsj.ordermanagement.common.api.Order;
import com.devonfw.module.basic.common.api.to.AbstractEto;

/**
 * Entity transport object of Order
 */
public class OrderEto extends AbstractEto implements Order {

	private static final long serialVersionUID = 1L;

	private Long bookingId;

	private Long invitedGuestId;

	private String bookingToken;

	private int status;

	private boolean paid;

	private boolean canceled;

	private boolean archived;

	private int[] possiblyStatuses = { 0, 1, 2, 3 };

	/**
	 * @return bookingToken
	 */
	public String getBookingToken() {

		return this.bookingToken;
	}

	/**
	 * @param bookingToken new value of {@link #getbookingToken}.
	 */
	public void setBookingToken(String bookingToken) {

		this.bookingToken = bookingToken;
	}

	private Long hostId;

	@Override
	public Long getBookingId() {

		return this.bookingId;
	}

	@Override
	public void setBookingId(Long bookingId) {

		this.bookingId = bookingId;
	}

	@Override
	public Long getInvitedGuestId() {

		return this.invitedGuestId;
	}

	@Override
	public void setInvitedGuestId(Long invitedGuestId) {

		this.invitedGuestId = invitedGuestId;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + (archived ? 1231 : 1237);
		result = prime * result + status;
		result = prime * result + ((bookingId == null) ? 0 : bookingId.hashCode());
		result = prime * result + ((bookingToken == null) ? 0 : bookingToken.hashCode());
		result = prime * result + (canceled ? 1231 : 1237);
		result = prime * result + ((hostId == null) ? 0 : hostId.hashCode());
		result = prime * result + ((invitedGuestId == null) ? 0 : invitedGuestId.hashCode());
		result = prime * result + (archived ? 1231 : 1237);
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		OrderEto other = (OrderEto) obj;
		if (archived != other.archived)
			return false;
		if (bookingId == null) {
			if (other.bookingId != null)
				return false;
		} else if (!bookingId.equals(other.bookingId))
			return false;
		if (bookingToken == null) {
			if (other.bookingToken != null)
				return false;
		} else if (!bookingToken.equals(other.bookingToken))
			return false;
		if (canceled != other.canceled)
			return false;
		if (hostId == null) {
			if (other.hostId != null)
				return false;
		} else if (!hostId.equals(other.hostId))
			return false;
		if (invitedGuestId == null) {
			if (other.invitedGuestId != null)
				return false;
		} else if (!invitedGuestId.equals(other.invitedGuestId))
			return false;
		if (status != other.status) {
			return false;
		}
		return true;
	}

	@Override
	public Long getHostId() {

		return this.hostId;
	}

	@Override
	public void setHostId(Long hostId) {

		this.hostId = hostId;
	}

	@Override
	public void setStatus(int status) {

		this.status = (IntStream.of(this.possiblyStatuses).anyMatch(n -> n == status) ? status : 0);
	}

	@Override
	public int getStatus() {

		return this.status;
	}

	@Override
	public boolean getCanceled() {
		return this.canceled;
	}

	@Override
	public void setCanceled(boolean canceled) {
		this.canceled = canceled;
	}

	@Override
	public boolean getArchived() {
		return this.archived;
	}

	@Override
	public void setArchived(boolean archived) {
		this.archived = archived;
	}

	@Override
	public boolean getPaid() {
		return this.paid;
	}

	@Override
	public void setPaid(boolean paid) {
		this.paid = paid;
	}

}

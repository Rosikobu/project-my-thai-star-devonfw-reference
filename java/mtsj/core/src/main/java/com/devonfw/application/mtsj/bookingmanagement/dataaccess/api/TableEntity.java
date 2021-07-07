package com.devonfw.application.mtsj.bookingmanagement.dataaccess.api;

import javax.persistence.Entity;

import com.devonfw.application.mtsj.bookingmanagement.common.api.Table;
import com.devonfw.application.mtsj.general.dataaccess.api.ApplicationPersistenceEntity;

@Entity
@javax.persistence.Table(name = "\"Table\"")
public class TableEntity extends ApplicationPersistenceEntity implements Table {

	public static class Create {
		private Long id;
		public Create() {}
		public Create Id(long val) { id = val; return this; }
		public TableEntity build() {return new TableEntity(this);}
	}

	public TableEntity() {}

	public TableEntity(Create c) { this.setId(c.id); }

	private int seatsNumber;

	private static final long serialVersionUID = 1L;

	/**
	 * @return seatsNumber
	 */
	@Override
	public int getSeatsNumber() {

		return this.seatsNumber;
	}

	/**
	 * @param seatsNumber new value of {@link #getseatsNumber}.
	 */
	@Override
	public void setSeatsNumber(int seatsNumber) {

		this.seatsNumber = seatsNumber;
	}

}

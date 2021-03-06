package com.devonfw.application.mtsj.bookingmanagement.common.api.to;

import com.devonfw.application.mtsj.general.common.api.to.AbstractSearchCriteriaTo;

/**
 * used to find {@link com.devonfw.application.mtsj.bookingmanagement.common.api.Table}s.
 */
public class TableSearchCriteriaTo extends AbstractSearchCriteriaTo {

  private static final long serialVersionUID = 1L;

  private int seatsNumber;

  /**
   * The constructor.
   */
  public TableSearchCriteriaTo() {

    super();
  }

  public int getSeatsNumber() {

    return this.seatsNumber;
  }

  public void setSeatsNumber(int seatsNumber) {

    this.seatsNumber = seatsNumber;
  }

}

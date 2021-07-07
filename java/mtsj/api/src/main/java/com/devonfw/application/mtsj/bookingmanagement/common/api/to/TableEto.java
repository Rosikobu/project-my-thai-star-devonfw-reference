package com.devonfw.application.mtsj.bookingmanagement.common.api.to;

import com.devonfw.application.mtsj.bookingmanagement.common.api.Table;
import com.devonfw.module.basic.common.api.to.AbstractEto;

/**
 * Entity transport object of Table
 */
public class TableEto extends AbstractEto implements Table {

  private static final long serialVersionUID = 1L;

  private int seatsNumber;

  @Override
  public int getSeatsNumber() {

    return this.seatsNumber;
  }

  @Override
  public void setSeatsNumber(int seatsNumber) {

    this.seatsNumber = seatsNumber;
  }

  @Override
  public int hashCode() {

    final int prime = 31;
    int result = 1;
    result = prime * result + this.seatsNumber;
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
    TableEto other = (TableEto) obj;
    if (this.seatsNumber != other.seatsNumber)
      return false;
    return true;
  }

}

package com.devonfw.application.mtsj.bookingmanagement.common.api;

import com.devonfw.application.mtsj.general.common.api.ApplicationEntity;

public interface Table extends ApplicationEntity {

  public int getSeatsNumber();

  public void setSeatsNumber(int seatsNumber);

}

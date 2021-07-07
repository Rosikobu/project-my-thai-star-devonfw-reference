package com.devonfw.application.mtsj.usermanagement.common.api.to;

/**
 * Entity transport object of ResetTokenMessageEto
 */
public class ResetTokenMessageEto {
	
	private String userName;
	
	private String message;

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
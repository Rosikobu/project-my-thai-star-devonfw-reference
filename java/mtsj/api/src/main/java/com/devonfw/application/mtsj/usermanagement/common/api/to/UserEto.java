package com.devonfw.application.mtsj.usermanagement.common.api.to;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.devonfw.application.mtsj.usermanagement.common.api.User;
import com.devonfw.module.basic.common.api.to.AbstractEto;

/**
 * Entity transport object of User
 */
public class UserEto extends AbstractEto implements User {

	private static final long serialVersionUID = 1L;

	private String username;

	private String email;

	private boolean twoFactorStatus;

	private Long userRoleId;

	private String password;

	private PasswordEncoder myEncoder = new PasswordEncoder() {

		@Override
		public boolean matches(CharSequence rawPassword, String encodedPassword) {
			return (new BCryptPasswordEncoder().encode(rawPassword) == encodedPassword ? true : false);
		}

		@Override
		public String encode(CharSequence rawPassword) {
			return "{bcrypt}" + new BCryptPasswordEncoder().encode(rawPassword);
		}
	};

	@Override
	public String getUsername() {

		return this.username;
	}

	@Override
	public void setUsername(String username) {

		this.username = username;
	}

	@Override
	public String getEmail() {

		return this.email;
	}

	@Override
	public void setEmail(String email) {

		this.email = email;
	}

	@Override
	public boolean getTwoFactorStatus() {

		return this.twoFactorStatus;
	}

	@Override
	public void setTwoFactorStatus(boolean twoFactorStatus) {

		this.twoFactorStatus = twoFactorStatus;
	}

	@Override
	public Long getUserRoleId() {

		return this.userRoleId;
	}

	@Override
	public void setUserRoleId(Long userRoleId) {

		this.userRoleId = userRoleId;
	}

	@Override
	public int hashCode() {

		final int prime = 31;
		int result = 1;
		result = prime * result + ((this.email == null) ? 0 : this.email.hashCode());
		result = prime * result + ((this.userRoleId == null) ? 0 : this.userRoleId.hashCode());
		result = prime * result + ((this.username == null) ? 0 : this.username.hashCode());
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
		UserEto other = (UserEto) obj;
		if (this.email == null) {
			if (other.email != null)
				return false;
		} else if (!this.email.equals(other.email))
			return false;
		if (this.userRoleId == null) {
			if (other.userRoleId != null)
				return false;
		} else if (!this.userRoleId.equals(other.userRoleId))
			return false;
		if (this.username == null) {
			if (other.username != null)
				return false;
		} else if (!this.username.equals(other.username))
			return false;
		return true;
	}

	@Override
	public void setPassword(String password) {
		this.password = myEncoder.encode(password);
	}

	@Override
	public String getPassword() {

		return this.password;
	}

}

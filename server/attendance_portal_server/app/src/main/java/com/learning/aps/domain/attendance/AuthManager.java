package com.learning.aps.domain.attendance;

import com.learning.aps.common.constant.AttendanceConstant;
import com.learning.aps.common.validator.MobileNumberValidator;
import com.learning.aps.dto.OtpResponse;
import com.learning.aps.dto.OtpSendRequest;
import com.learning.aps.dto.OtpVerifyRequest;
import com.learning.aps.service.abstraction.OtpService;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuthManager {

  private final OtpService otpService;

  public CompletableFuture<OtpResponse> sendOtp(OtpSendRequest request) {
    return CompletableFuture.completedFuture(request.getMobileNumber())
        .thenApply(this::validateMobileNumber)
        .thenCompose(otpService::generateOtp)
        .thenApply(otp -> buildSendSuccessResponse(request.getMobileNumber()))
        .exceptionally(ex -> buildErrorResponse(ex.getCause() != null ? ex.getCause() : ex));
  }

  public CompletableFuture<OtpResponse> verifyOtp(OtpVerifyRequest request) {
    return CompletableFuture.completedFuture(request)
        .thenApply(this::validateVerifyRequest)
        .thenCompose(req -> otpService.verifyOtp(req.getMobileNumber(), req.getOtp()))
        .thenCompose(isValid -> handleVerificationResult(isValid, request.getMobileNumber()))
        .exceptionally(ex -> buildErrorResponse(ex.getCause() != null ? ex.getCause() : ex));
  }

  private String validateMobileNumber(String mobileNumber) {
    if (!MobileNumberValidator.isValid(mobileNumber)) {
      throw new IllegalArgumentException("Invalid mobile number format: " + mobileNumber);
    }
    log.info("Mobile number validated: {}", mobileNumber);
    return mobileNumber;
  }

  private OtpVerifyRequest validateVerifyRequest(OtpVerifyRequest request) {
    if (!MobileNumberValidator.isValid(request.getMobileNumber())) {
      throw new IllegalArgumentException("Invalid mobile number format");
    }
    if (request.getOtp() == null || request.getOtp().isBlank()) {
      throw new IllegalArgumentException("OTP cannot be empty");
    }
    if (request.getOtp().length() != AttendanceConstant.OTP_LENGTH) {
      throw new IllegalArgumentException("OTP must be " + AttendanceConstant.OTP_LENGTH + " digits");
    }
    return request;
  }

  private CompletableFuture<OtpResponse> handleVerificationResult(
      boolean isValid, String mobileNumber) {
    if (isValid) {
      return otpService.invalidateOtp(mobileNumber)
          .thenApply(v -> OtpResponse.builder()
              .success(true)
              .message("OTP verified successfully")
              .mobileNumber(mobileNumber)
              .build());
    }
    return CompletableFuture.completedFuture(
        OtpResponse.builder()
            .success(false)
            .message("Invalid or expired OTP")
            .mobileNumber(mobileNumber)
            .build());
  }

  private OtpResponse buildSendSuccessResponse(String mobileNumber) {
    return OtpResponse.builder()
        .success(true)
        .message("OTP sent successfully")
        .mobileNumber(mobileNumber)
        .expiresInSeconds(AttendanceConstant.OTP_EXPIRY_SECONDS)
        .build();
  }

  private OtpResponse buildErrorResponse(Throwable ex) {
    log.error("Error in OTP flow: {}", ex.getMessage());
    return OtpResponse.builder()
        .success(false)
        .message(ex.getMessage())
        .build();
  }
}

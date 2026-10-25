package com.learning.aps.service.impl;

import com.learning.aps.common.constant.AttendanceConstant;
import com.learning.aps.service.abstraction.OtpService;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OtpServiceImpl implements OtpService {

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private record OtpEntry(String otp, Instant expiresAt) {
    boolean isExpired() {
      return Instant.now().isAfter(expiresAt);
    }
  }

  private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

  @Override
  public CompletableFuture<String> generateOtp(String mobileNumber) {
    return CompletableFuture.supplyAsync(() -> {
      String otp = generateSecureOtp();
      Instant expiresAt = Instant.now().plusSeconds(AttendanceConstant.OTP_EXPIRY_SECONDS);
      otpStore.put(mobileNumber, new OtpEntry(otp, expiresAt));

      log.info("============================================");
      log.info("  OTP for {} : {}", mobileNumber, otp);
      log.info("  Expires at : {}", expiresAt);
      log.info("============================================");

      return otp;
    });
  }

  @Override
  public CompletableFuture<Boolean> verifyOtp(String mobileNumber, String otp) {
    return CompletableFuture.supplyAsync(() -> {
      OtpEntry entry = otpStore.get(mobileNumber);

      if (entry == null) {
        log.warn("No OTP found for mobile: {}", mobileNumber);
        return false;
      }

      if (entry.isExpired()) {
        log.warn("OTP expired for mobile: {}", mobileNumber);
        otpStore.remove(mobileNumber);
        return false;
      }

      boolean isValid = entry.otp().equals(otp);
      if (isValid) {
        log.info("OTP verified successfully for mobile: {}", mobileNumber);
      } else {
        log.warn("Invalid OTP attempt for mobile: {}", mobileNumber);
      }

      return isValid;
    });
  }

  @Override
  public CompletableFuture<Void> invalidateOtp(String mobileNumber) {
    return CompletableFuture.runAsync(() -> {
      otpStore.remove(mobileNumber);
      log.info("OTP invalidated for mobile: {}", mobileNumber);
    });
  }

  private String generateSecureOtp() {
    int bound = (int) Math.pow(10, AttendanceConstant.OTP_LENGTH);
    int otp = SECURE_RANDOM.nextInt(bound);
    return String.format("%0" + AttendanceConstant.OTP_LENGTH + "d", otp);
  }
}

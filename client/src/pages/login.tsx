import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, UserRound } from "lucide-react";
import appIcon from "@assets/generated_images/App_icon_with_naira_and_checkmark_bbb97aab.png";

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const saveUserAndContinue = (user: { id: string; phoneNumber: string; displayName: string | null }) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userId", user.id);
    localStorage.setItem("phoneNumber", user.phoneNumber);
    if (user.displayName) {
      localStorage.setItem("displayName", user.displayName);
    }
    window.location.assign("/");
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { loginToDemoAccount } = await import("@/lib/api");
      const { user } = await loginToDemoAccount();
      saveUserAndContinue(user);
    } catch (error) {
      console.error("Error logging in to demo account:", error);
      setErrorMessage("Demo login is unavailable. Use phone verification instead.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const { sendOtp } = await import("@/lib/api");
      await sendOtp(phoneNumber);
      setStep("otp");
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Could not send an OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const { verifyOtp } = await import("@/lib/api");
      const { user } = await verifyOtp(phoneNumber, otp);
      saveUserAndContinue(user);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setErrorMessage("Could not verify that code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={appIcon} alt="Dem Don Pay" className="w-20 h-20" />
          </div>
          <div>
            <h1 className="font-accent text-3xl font-bold text-foreground">Dem Don Pay</h1>
            <p className="text-muted-foreground mt-2">Know when salary enter — before you ask!</p>
          </div>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {step === "phone" ? (
                <>
                  <Phone className="w-5 h-5" />
                  Enter Phone Number
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify OTP
                </>
              )}
            </CardTitle>
            <CardDescription>
              {step === "phone"
                ? "We'll send you a one-time password to verify your number"
                : `Enter the 6-digit code sent to ${phoneNumber}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08012345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    data-testid="input-phone-number"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || phoneNumber.length < 10}
                  data-testid="button-send-otp"
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    required
                    data-testid="input-otp"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || otp.length !== 6}
                  data-testid="button-verify-otp"
                >
                  {isLoading ? "Verifying..." : "Verify & Login"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("phone")}
                  data-testid="button-back"
                >
                  Change Phone Number
                </Button>
              </form>
            )}
            {errorMessage && (
              <p role="alert" className="mt-4 text-sm text-destructive">
                {errorMessage}
              </p>
            )}
            {step === "phone" && import.meta.env.DEV && (
              <div className="mt-5 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  data-testid="button-demo-login"
                >
                  <UserRound className="mr-2 h-4 w-4" />
                  {isLoading ? "Opening demo..." : "Continue with demo account"}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Development preview only
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}

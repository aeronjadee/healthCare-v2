import RequirePatient from "@/components/RequirePatient";
import MyAppointmentsContent from "@/components/MyAppointmentsContent";

export default function MyAppointments() {
  return (
    <RequirePatient>
      <MyAppointmentsContent />
    </RequirePatient>
  );
}

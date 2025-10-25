import RequirePatient from "@/components/RequirePatient";
import BookPageContent from "@/components/BookPageContent";

export default function BookAppointment() {
  return (
    <RequirePatient>
      <BookPageContent />
    </RequirePatient>
  );
}

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export interface BookingPayload {
  serviceId: string;
  customerEmail: string;
  eventDate: string;
  eventLocation: string;
  message?: string;
}

export async function createBooking(payload: BookingPayload) {
  const res = await fetch(`${API_URL}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok || !data?.success) {
    throw new Error(data?.message || `Failed to submit booking (${res.status}).`);
  }
  return data;
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, MapPin, ShieldAlert } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { createBooking } from "@/lib/bookings";

interface Service {
    _id?: string;
    name?: string;
    serviceName?: string;
    category?: string;
    price?: number;
    location?: string;
}

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");

export default function BookServicePage() {
    const params = useParams();
    const router = useRouter();
    const serviceId = params.id as string;

    const { data: session, isPending } = useSession();
    const role = session?.user?.role?.toLowerCase();

    const [service, setService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(true);

    const [eventDate, setEventDate] = useState("");
    const [eventLocation, setEventLocation] = useState("");
    const [message, setMessage] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Send logged-out users to login
    useEffect(() => {
        if (!isPending && !session?.user) router.push("/login");
    }, [isPending, session, router]);

    // Load service summary
    useEffect(() => {
        if (!serviceId) return;
        (async () => {
            try {
                const res = await fetch(`${API_URL}/services`);
                const data = await res.json();
                const list: Service[] = Array.isArray(data) ? data : data.data ?? [];
                setService(list.find((s) => s._id === serviceId) ?? null);
            } catch (err) {
                console.error("Service load error:", err);
            } finally {
                setLoading(false);
            }
        })();
    }, [serviceId]);

    if (isPending || loading) {
        return (
            <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#85323B]" />
            </div>
        );
    }

    if (!session?.user) return null;

    const serviceName = service?.serviceName || service?.name || "this service";

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        try {
            setSubmitting(true);
            await createBooking({
                serviceId,
                customerEmail: session.user.email,
                eventDate,
                eventLocation,
                message,
            });
            setSubmitted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#382925]">
            <main className="max-w-xl mx-auto px-5 pt-9 pb-20">

                <Link
                    href={`/services/${serviceId}`}
                    className="inline-flex items-center gap-2 text-sm text-[#806D65] hover:text-[#85323B] transition mb-7"
                >
                    <ArrowLeft size={16} />
                    Back to service
                </Link>

                <div className="bg-white border border-[#E7DCCE] rounded-2xl p-6 shadow-[0_4px_12px_rgba(60,40,25,0.10)]">
                    <h1 className="font-serif text-2xl font-semibold">Request a Booking</h1>
                    <p className="text-sm text-[#806D65] mt-1">
                        You are booking <span className="font-medium text-[#382925]">{serviceName}</span>.
                    </p>

                    {role !== "customer" ? (
                        <div className="rounded-xl bg-[#F3ECE3] px-5 py-5 text-center mt-5">
                            <ShieldAlert size={24} className="text-[#D88712] mx-auto mb-3" />
                            <p className="text-sm leading-6 text-[#79665B]">
                                Only customer accounts can request bookings.
                            </p>
                        </div>
                    ) : submitted ? (
                        <div className="rounded-xl border border-emerald-200 bg-[#ECFDF5] px-4 py-6 text-center mt-5">
                            <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-4" />
                            <h3 className="font-serif text-lg font-semibold text-emerald-900">
                                Booking Request Submitted
                            </h3>
                            <p className="text-xs leading-5 text-emerald-800 mt-3">
                                Your request is now Pending vendor review. You can track it
                                anytime from your Customer Dashboard.
                            </p>
                            <Link
                                href="/dashboard/customer/bookings"
                                className="w-full flex items-center justify-center mt-5 bg-[#85323B] hover:bg-[#6E2730] text-white rounded-xl h-10 text-sm font-medium transition"
                            >
                                View My Bookings
                            </Link>
                            <Link
                                href="/services"
                                className="w-full flex items-center justify-center mt-2 border border-[#E7DCCE] bg-white hover:bg-[#FAF7F0] rounded-xl h-10 text-sm font-medium transition"
                            >
                                Browse more services
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
                            <div>
                                <label htmlFor="eventDate" className="block text-sm font-medium mb-2">
                                    Event Date
                                </label>
                                <input
                                    id="eventDate"
                                    type="date"
                                    required
                                    min={new Date().toISOString().split("T")[0]}
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-[#E7DCCE] text-sm outline-none focus:border-[#85323B]"
                                />
                            </div>

                            <div>
                                <label htmlFor="eventLocation" className="block text-sm font-medium mb-2">
                                    Event Location / Venue
                                </label>
                                <div className="relative">
                                    <MapPin
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#907C6E]"
                                    />
                                    <input
                                        id="eventLocation"
                                        type="text"
                                        required
                                        value={eventLocation}
                                        onChange={(e) => setEventLocation(e.target.value)}
                                        placeholder="e.g. Hotel Radisson, Dhaka"
                                        className="w-full h-11 pl-10 pr-3 rounded-xl border border-[#E7DCCE] text-sm outline-none focus:border-[#85323B]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="bookingMessage" className="block text-sm font-medium mb-2">
                                    Additional Message (Optional)
                                </label>
                                <textarea
                                    id="bookingMessage"
                                    rows={3}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Share your guest count, timeline, or special preferences..."
                                    className="w-full px-3 py-3 rounded-xl border border-[#E7DCCE] text-sm outline-none resize-y focus:border-[#85323B]"
                                />
                            </div>

                            {error && <p className="text-sm text-red-600">{error}</p>}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full h-11 flex items-center justify-center gap-2 bg-[#85323B] hover:bg-[#6E2730] disabled:opacity-60 text-white rounded-xl text-sm font-medium transition"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={17} className="animate-spin" />
                                        Sending Request...
                                    </>
                                ) : (
                                    "Send Booking Request"
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
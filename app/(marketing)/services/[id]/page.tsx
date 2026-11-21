"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    MapPin,
    ShieldAlert,
    Star,
    Crown,
    Loader2,
    CalendarCheck,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";

interface Vendor {
    name?: string;
    businessName?: string;
    image?: string;
    logo?: string;
    rating?: number;
    totalReviews?: number;
    completedWeddings?: number;
    isPremium?: boolean;
}

interface Service {
    _id?: string;
    id?: string;
    name?: string;
    serviceName?: string;
    category: string;
    description: string;
    price: number;
    location: string;
    images?: string[];
    photoUrl?: string | null;
    vendorId?: string;
    vendor?: Vendor;
    vendorEmail?: string;
    status: string;
    isActive?: boolean;
    available?: boolean;
}

const API_URL = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

export default function ServiceDetailsPage() {
    const params = useParams();
    const serviceId = params.id as string;

    const { data: session, isPending } = useSession();

    const [service, setService] = useState<Service | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const role = session?.user?.role?.toLowerCase();

    useEffect(() => {
        if (!serviceId) return;

        const fetchService = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/services`);
                if (!response.ok) throw new Error("Failed to fetch services");

                const data = await response.json();
                const services: Service[] = Array.isArray(data) ? data : data.data ?? [];

                const foundService = services.find(
                    (item) => item._id === serviceId || item.id === serviceId
                );

                if (!foundService) throw new Error("Service not found.");
                setService(foundService);
            } catch (err) {
                console.error("Service fetch error:", err);
                setError(err instanceof Error ? err.message : "Unable to load service.");
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [serviceId]);

    if (isPending || loading) {
        return (
            <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#85323B]" />
            </div>
        );
    }

    if (!session?.user) return null;

    if (error || !service) {
        return (
            <div className="min-h-screen bg-[#FAF7F0]">
                <div className="max-w-5xl mx-auto px-5 py-24 text-center">
                    <h2 className="text-3xl font-serif text-[#432D29]">
                        {error || "Service not found"}
                    </h2>
                    <Link
                        href="/services"
                        className="inline-flex items-center gap-2 mt-6 text-[#85323B]"
                    >
                        <ArrowLeft size={17} />
                        Back to services
                    </Link>
                </div>
            </div>
        );
    }

    const serviceName = service.serviceName || service.name || "Wedding Service";

    const images = service.images?.length
        ? service.images
        : service.photoUrl
            ? [service.photoUrl]
            : [];

    const vendorName =
        service.vendor?.businessName ||
        service.vendor?.name ||
        "Wedding Service Provider";

    const isVendor = role === "vendor";
    const isAdmin = role === "admin";
    const canBook = role === "customer";

    const price = new Intl.NumberFormat("en-BD").format(service.price);

    return (
        <div className="min-h-screen bg-[#FAF7F0] text-[#382925]">
            <main className="max-w-7xl mx-auto px-5 lg:px-8 pt-9 pb-20">

                <Link
                    href="/services"
                    className="inline-flex items-center gap-2 text-sm text-[#806D65] hover:text-[#85323B] transition mb-7"
                >
                    <ArrowLeft size={16} />
                    Back to services
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-8 lg:gap-9 items-start">

                    {/* LEFT SIDE */}
                    <div className="min-w-0">

                        <div className="space-y-3">
                            <div className="relative w-full aspect-[1.55/1] rounded-2xl overflow-hidden bg-[#EDE5D9] shadow-sm">
                                {images.length > 0 ? (
                                    <Image
                                        src={images[selectedImage] ?? images[0]}
                                        alt={`${serviceName} - service gallery image`}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        className="object-cover transition-opacity duration-300"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-sm text-[#9A8174]">
                                        No image available
                                    </div>
                                )}
                            </div>

                            {images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-1">
                                    {images.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setSelectedImage(index)}
                                            aria-label={`View image ${index + 1}`}
                                            className={`relative shrink-0 w-28 sm:w-36 aspect-[1.3/1] rounded-lg overflow-hidden border-2 transition ${selectedImage === index
                                                ? "border-[#85323B]"
                                                : "border-transparent opacity-75 hover:opacity-100"
                                                }`}
                                        >
                                            <Image
                                                src={image}
                                                alt={`${serviceName} ${index + 1}`}
                                                fill
                                                sizes="144px"
                                                className="object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-8">
                            <span className="inline-flex items-center rounded-full bg-[#FCE5E1] border border-[#EAC3BC] px-3 py-1 text-xs text-[#85323B]">
                                {service.category}
                            </span>

                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] leading-tight mt-4 text-[#332421]">
                                {serviceName}
                            </h1>

                            <div className="flex items-center gap-2 mt-4 text-sm text-[#806D65]">
                                <MapPin size={17} />
                                {service.location}
                            </div>

                            <div className="border-t border-[#E7DDD1] mt-7 pt-7">
                                <h2 className="font-serif text-2xl mb-3">About this service</h2>
                                <p className="text-[15px] leading-7 text-[#76645C] whitespace-pre-line">
                                    {service.description}
                                </p>
                            </div>

                            {/* Vendor Information */}
                            <div className="mt-9">
                                <div className="bg-white/80 border border-[#E8DDD1] rounded-xl p-5 shadow-sm flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#85323B] flex items-center justify-center text-white font-serif text-lg">
                                        {service.vendor?.logo || service.vendor?.image ? (
                                            <Image
                                                src={service.vendor.logo || service.vendor.image || ""}
                                                alt={vendorName}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            vendorName.charAt(0).toUpperCase()
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] uppercase tracking-[2px] text-[#9A8174]">
                                            Offered by
                                        </p>

                                        <div className="flex items-center flex-wrap gap-2 mt-0.5">
                                            <h3 className="font-serif text-lg">{vendorName}</h3>

                                            {service.vendor?.isPremium && (
                                                <span className="inline-flex items-center gap-1 bg-[#F6DDB8] text-[#79521C] rounded-full px-2 py-0.5 text-[10px] font-semibold">
                                                    <Crown size={11} />
                                                    Premium
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1 text-sm text-[#947B68] mt-1">
                                            <Star size={14} fill="#C18B3C" className="text-[#C18B3C]" />
                                            {service.vendor?.rating ?? "New"}
                                            {service.vendor?.completedWeddings != null && (
                                                <span>· {service.vendor.completedWeddings}+ weddings</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDE - PRICE + BOOK BUTTON */}
                    <aside className="lg:sticky lg:top-24">
                        <div className="bg-white border border-[#E7DCCE] rounded-2xl p-5 sm:p-6 shadow-[0_4px_12px_rgba(60,40,25,0.10)]">

                            <p className="text-[10px] uppercase tracking-[2px] text-[#9A8174]">
                                Starting from
                            </p>
                            <p className="font-serif text-3xl text-[#382925] mt-1">
                                ৳{price}
                            </p>

                            <p className="text-sm text-[#806D65] mt-3 leading-relaxed">
                                Reserve this vendor for your wedding date and share
                                celebration details.
                            </p>

                            {canBook && (
                                <Link
                                    href={`/services/${serviceId}/book`}
                                    className="w-full h-11 mt-5 flex items-center justify-center gap-2 bg-[#85323B] hover:bg-[#6E2730] text-white rounded-xl text-sm font-medium transition"
                                >
                                    <CalendarCheck size={17} />
                                    Book this service
                                </Link>
                            )}

                            {isVendor && (
                                <div className="rounded-xl bg-[#F3ECE3] px-5 py-5 text-center mt-5">
                                    <ShieldAlert size={24} className="text-[#D88712] mx-auto mb-3" />
                                    <p className="text-sm leading-6 text-[#79665B]">
                                        Vendors can’t book services. Switch to a customer
                                        account to request bookings.
                                    </p>
                                </div>
                            )}

                            {isAdmin && (
                                <div className="rounded-xl bg-[#F3ECE3] px-5 py-5 text-center mt-5">
                                    <ShieldAlert size={24} className="text-[#D88712] mx-auto mb-3" />
                                    <p className="text-sm leading-6 text-[#79665B]">
                                        Admin accounts cannot submit service bookings.
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
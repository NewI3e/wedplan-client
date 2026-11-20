
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

import {
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  Store,
} from "lucide-react";

import { useSession } from "@/lib/auth-client";

import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Service = {
  _id: string;
  name: string;
  category: string;
  location: string;
  price: number;
  description: string;
  photoUrl: string | null;
  status: string;
  createdAt: string;
  isActive?: boolean;
  vendor?: {
    name?: string;
    image?: string;
    rating?: number;
  };
};

export default function ServicesPage() {
  const router = useRouter();

  const { data: session, isPending: authLoading } = useSession();

  const shouldReduceMotion = useReducedMotion();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");

  const [error, setError] = useState("");

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const apiUrl = (
          process.env.NEXT_PUBLIC_API_URL ?? ""
        ).replace(/\/+$/, "");

        const response = await fetch(`${apiUrl}/services`);

        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }

        const data: Service[] = await response.json();

        setServices(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load services. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Only approved and active services
  const approvedServices = useMemo(() => {
    return services.filter(
      (service) =>
        // service.status === "approved" &&
        service.isActive !== false
    );
  }, [services]);

  // Get categories dynamically from API
  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        approvedServices.map((service) => service.category)
      ),
    ];
  }, [approvedServices]);

  // Get locations dynamically from API
  const locations = useMemo(() => {
    return [
      "All",
      ...new Set(
        approvedServices.map((service) => service.location)
      ),
    ];
  }, [approvedServices]);

  // Search and filters
  const filteredServices = useMemo(() => {
    return approvedServices.filter((service) => {
      const matchesSearch = service.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        service.category === category;

      const matchesLocation =
        location === "All" ||
        service.location === location;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    });
  }, [approvedServices, search, category, location]);

  // Authentication-based navigation
  const handleViewDetails = (id: string) => {
    if (authLoading) return;

    if (!session?.user) {
      router.push("/signin");
      return;
    }

    router.push(`/services/${id}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("All");
  };

  return (
    <main className="min-h-screen bg-[#fbf7ef]">

      {/* Hero and Filters */}
      <section className="border-b border-[#e8decd] bg-[#faeee7]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 sm:py-14 md:py-20">

          {/* Hero Content */}
          <motion.div
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, y: 20 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#b08a3e]">
              Browse Services
            </p>

            <h1 className="font-display text-3xl font-medium leading-tight text-[#2b2118] sm:text-4xl md:text-5xl">
              Find your perfect vendors
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#79685e] sm:mt-4 sm:text-base">
              Explore approved wedding services across Bangladesh.
              Sign in to view full details and send booking requests.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="mt-8 rounded-2xl border border-[#e8decd] bg-white p-3 shadow-sm sm:mt-9 sm:p-4">

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_210px_180px]">

              {/* Search Input */}
              <div className="relative min-w-0">
                <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#907f72]" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services by name..."
                  className="h-12 w-full border-[#eee4d5] bg-[#faf7f1] pl-10 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#7a1f3d]"
                />
              </div>

              {/* Category Dropdown */}
              <Select
                value={category}
                onValueChange={(value) => setCategory(value ?? "All")}
              >
                <SelectTrigger className="h-12 w-full border-[#eee4d5] bg-[#faf7f1] px-3.5 text-sm focus:ring-1 focus:ring-[#7a1f3d]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>

                <SelectContent className="max-h-64">
                  {categories.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item === "All"
                        ? "All categories"
                        : item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Location Dropdown */}
              <Select
                value={location}
                onValueChange={(value) => setLocation(value ?? "All")}
              >
                <SelectTrigger className="h-12 w-full border-[#eee4d5] bg-[#faf7f1] px-3.5 text-sm focus:ring-1 focus:ring-[#7a1f3d]">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>

                <SelectContent className="max-h-64">
                  {locations.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item === "All"
                        ? "All locations"
                        : item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

            </div>
          </div>

          {/* Category Pills - Hidden on Mobile */}
          <div className="mt-5 hidden flex-wrap gap-2 sm:flex">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs transition-colors ${
                  category === item
                    ? "border-[#7a1f3d] bg-[#7a1f3d] text-white"
                    : "border-[#e8decd] bg-white text-[#51443c] hover:border-[#7a1f3d]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Service Listings */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-5 sm:py-10 md:py-12">

        {/* Service Count */}
        <div className="mb-6 flex items-center justify-between sm:mb-7">
          <p className="flex items-center gap-2 text-xs text-[#79685e] sm:text-sm">
            <SlidersHorizontal className="size-4" />

            {loading
              ? "Loading services..."
              : `${filteredServices.length} services found`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden border-[#e8decd] p-0"
              >
                <div className="aspect-[4/3] animate-pulse bg-[#eee5d9]" />

                <CardContent className="space-y-3 p-4 sm:p-5">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-[#eee5d9]" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-[#eee5d9]" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-[#eee5d9]" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="py-16 text-center sm:py-20">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <Button
              className="mt-4 bg-[#7a1f3d]"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d9cbb9] px-4 py-16 text-center sm:py-20">
            <Store className="mx-auto size-10 text-[#b08a3e]" />

            <h2 className="mt-4 font-display text-xl text-[#2b2118] sm:text-2xl">
              No services found
            </h2>

            <p className="mt-2 text-sm text-[#79685e]">
              Try changing your search or filters.
            </p>

            <Button
              variant="outline"
              className="mt-5"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          </div>
        )}

        {/* Service Cards */}
        {!loading && !error && filteredServices.length > 0 && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: shouldReduceMotion ? 0 : 0.08,
                },
              },
            }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
          >
            {filteredServices.map((service) => (
              <motion.div
                key={service._id}
                variants={{
                  hidden: shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                transition={{ duration: 0.4 }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -5 }
                }
              >
                <Card className="group h-full overflow-hidden rounded-xl border-[#e8decd] bg-white p-0 shadow-sm transition-shadow hover:shadow-lg">

                  {/* Service Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#eee5d9]">

                    {service.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={service.photoUrl}
                        alt={service.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center">
                        <Store className="size-12 text-[#c3ad91]" />
                      </div>
                    )}

                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7a1f3d]">
                      {service.category}
                    </span>
                  </div>

                  {/* Service Information */}
                  <CardContent className="space-y-3 p-4 sm:p-5">

                    <h2 className="line-clamp-1 font-display text-lg text-[#2b2118] sm:text-xl">
                      {service.name}
                    </h2>

                    <p className="flex items-center gap-1.5 text-xs text-[#79685e]">
                      <MapPin className="size-3.5 shrink-0" />
                      {service.location}
                    </p>

                    {/* Vendor Information */}
                    {service.vendor && (
                      <div className="flex items-center justify-between gap-2">

                        <div className="flex min-w-0 items-center gap-2">

                          {service.vendor.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={service.vendor.image}
                              alt=""
                              className="size-8 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f8e9e5] text-xs text-[#7a1f3d]">
                              {service.vendor.name?.charAt(0) || "V"}
                            </div>
                          )}

                          <span className="truncate text-xs font-medium text-[#2b2118]">
                            {service.vendor.name}
                          </span>
                        </div>

                        {service.vendor.rating !== undefined && (
                          <span className="flex shrink-0 items-center gap-1 text-xs">
                            <Star className="size-3 fill-[#b08a3e] text-[#b08a3e]" />
                            {service.vendor.rating}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div className="border-t border-[#eee4d5] pt-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#907f72]">
                        Starting at
                      </p>

                      <p className="mt-1 font-display text-xl font-semibold text-[#7a1f3d]">
                        ৳{service.price.toLocaleString("en-BD")}
                      </p>
                    </div>

                  </CardContent>

                  {/* Details Button */}
                  <CardFooter className="px-4 pb-4 pt-0 sm:px-5 sm:pb-5">
                    <Button
                      onClick={() => handleViewDetails(service._id)}
                      disabled={authLoading}
                      className="h-10 w-full rounded-full bg-[#7a1f3d] text-white hover:bg-[#671a33]"
                    >
                      View Details
                    </Button>
                  </CardFooter>

                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

      </section>
    </main>
  );
}

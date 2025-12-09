"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [countries, setCountries] = useState([]);
  const [allCountries, setAllCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    dob: "",
    country: "",
    contact: "",
    occupation: "",
  });

  // ------------------------------------------
  // FETCH COUNTRIES
  // ------------------------------------------
  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=cca2,name,flags")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c) => ({
            code: c.cca2,
            name: c.name.common,
            flag: c.flags?.png || "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(sorted);
        setAllCountries(sorted);
      })
      .catch(console.error);
  }, []);

  // ------------------------------------------
  // CLOSE DROPDOWN WHEN CLICKED OUTSIDE
  // ------------------------------------------
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ------------------------------------------
  // SUBMIT FORM
  // ------------------------------------------
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        toast.error("Registration failed: " + data.message);
        return;
      }

      toast.success("Registration Successful!");

      localStorage.setItem("registered_email", form.email);
      localStorage.setItem("registered_name", form.name);

      setForm({
        name: "",
        email: "",
        dob: "",
        country: "",
        contact: "",
        occupation: "",
      });

      setSelectedCountry(null);

      setTimeout(() => {
        window.location.href = "/questions";
      }, 800);
    } catch (err) {
      console.error(err);
      toast.error("Registration failed. Check console for details.");
      setLoading(false);
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center bg-linear-to-br from-[#16e0c3] via-[#0bc5ea] to-[#009dff] p-4">
      <div className="relative w-full max-w-md sm:max-w-lg bg-white p-6 sm:p-12 rounded-2xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-10 text-[#03A9F4]">
          • Registration Form •
        </h1>

        <form className="space-y-5 sm:space-y-7" onSubmit={handleSubmit}>
          {/* NAME */}
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          {/* DOB */}
          <div className="w-full pb-2 sm:pb-3">
            <span className="text-gray-500 block mb-1">Date Of Birth</span>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => setForm({ ...form, dob: e.target.value })}
              className="w-full pb-2 border-b border-[#00BBD4] bg-transparent text-black focus:outline-none"
              required
            />
          </div>

          {/* COUNTRY DROPDOWN WITH INLINE SEARCH */}
          <div className="relative w-full" ref={dropdownRef}>
            <label className="text-gray-500 block mb-1">Country</label>

            <div className="relative">
              {selectedCountry && (
                <img
                  src={selectedCountry.flag}
                  alt={selectedCountry.name}
                  className="w-5 h-3 sm:w-6 sm:h-4 object-cover absolute left-2 top-3 -translate-y-1/2"
                />
              )}
              <input
                type="text"
                placeholder="Select Country"
                value={selectedCountry?.name || form.country}
                onClick={() => setDropdownOpen(true)}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({ ...form, country: val });
                  setDropdownOpen(true);
                  setSelectedCountry(null);
                  const filtered = allCountries.filter((c) =>
                    c.name.toLowerCase().includes(val.toLowerCase())
                  );
                  setCountries(filtered);
                }}
                className={`w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black bg-transparent focus:outline-none ${
                  selectedCountry ? "pl-10" : "pl-2"
                }`}
                required
              />
            </div>

            {dropdownOpen && (
              <div className="absolute z-20 w-full bg-white border border-gray-300 mt-1 max-h-72 overflow-y-auto rounded-lg shadow-lg">
                {countries.map((c) => (
                  <div
                    key={c.code}
                    className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-blue-100 text-black"
                    onClick={() => {
                      setSelectedCountry(c);
                      setForm({ ...form, country: c.name });
                      setDropdownOpen(false);
                    }}
                  >
                    <img
                      src={c.flag}
                      alt={c.name}
                      className="w-5 h-3 sm:w-6 sm:h-4 object-cover"
                    />
                    <span>{c.name}</span>
                  </div>
                ))}
                {countries.length === 0 && (
                  <div className="px-3 py-2 text-gray-500">No country found</div>
                )}
              </div>
            )}
          </div>

          {/* CONTACT */}
          <input
            type="text"
            placeholder="Contact Number"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          {/* OCCUPATION */}
          <input
            type="text"
            placeholder="Occupation"
            value={form.occupation}
            onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            className="w-full pb-2 sm:pb-3 border-b border-[#00BBD4] text-black focus:outline-none"
            required
          />

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 sm:py-4 rounded-md font-bold text-lg sm:text-xl text-white 
              bg-linear-to-r from-[#00E0FF] via-[#00B2FF] to-[#006CFF] shadow-lg
              transition relative overflow-hidden
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-95"}
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="animate-pulse">Processing…</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              "REGISTER"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

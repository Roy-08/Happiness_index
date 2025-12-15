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
    ageGroup: "",
  });

  // FETCH COUNTRIES
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

  // CLOSE DROPDOWN
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // SUBMIT FORM
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // REGISTER API
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

      // SUBMIT ANSWERS API (optional)
      try {
        await fetch("/api/submitAnswers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
          }),
        });
      } catch (err) {
        console.error("submitAnswers failed", err);
      }

      toast.success("Response Collected");

      localStorage.setItem("registered_email", form.email);
      localStorage.setItem("registered_name", form.name);

      setForm({
        name: "",
        email: "",
        dob: "",
        country: "",
        contact: "",
        occupation: "",
        ageGroup: "",
      });
      setSelectedCountry(null);

      // Redirect to response page instead of questions
      window.location.href = "/response";
    } catch (err) {
      console.error(err);
      toast.error("Registration failed.");
      setLoading(false);
    }
  }

  return (
    <div className="w-screen min-h-screen flex items-center justify-center 
      bg-linear-to-br from-[#FFF9C4] via-[#FFF176] to-[#C8E6C9] p-4">

      <div className="relative w-full max-w-md sm:max-w-lg 
        bg-white p-6 sm:p-12 rounded-2xl shadow-2xl">

        <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-8 sm:mb-10 
          text-[#9E9D24]">
          • Tell Us About You •
        </h1>

        <form className="space-y-5 sm:space-y-7" onSubmit={handleSubmit}>

          {/* FULL NAME */}
          <div className="relative">
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full pb-2 sm:pb-3 border-b border-[#D4E157] text-black pr-6 focus:outline-none"
              required
            />
            <span className="absolute right-0 top-1 text-red-500 text-xl">*</span>
          </div>

          {/* EMAIL */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pb-2 sm:pb-3 border-b border-[#D4E157] text-black pr-6 focus:outline-none"
              required
            />
            <span className="absolute right-0 top-1 text-red-500 text-xl">*</span>
          </div>

          {/* AGE GROUP */}
          <div className="w-full pb-2 sm:pb-3">
            <span className="text-gray-500 block mb-1">Age Group</span>
            <div className="relative w-full">
              <select
                value={form.ageGroup || ""}
                onChange={(e) => setForm({ ...form, ageGroup: e.target.value })}
                className="appearance-none w-full pb-2 sm:pb-3 border-b border-[#D4E157] text-black bg-transparent focus:outline-none cursor-pointer pr-8"
                required
              >
                <option className="text-gray-500" value="" disabled>Select Age Group</option>
                <option value="Under 18">Under 18</option>
                <option value="18 – 24">18 – 24</option>
                <option value="25 – 34">25 – 34</option>
                <option value="35 – 44">35 – 44</option>
                <option value="45 – 54">45 – 54</option>
                <option value="55+">55+</option>
              </select>

              <div className="pointer-events-none absolute right-0 top-1/2 transform -translate-y-1/2 pr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4E157]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* COUNTRY */}
          <div className="relative w-full" ref={dropdownRef}>
            <label className="text-gray-500 block mb-1">Country</label>
            <div className="flex items-center border-b border-[#D4E157] pb-2 sm:pb-3">
              {selectedCountry && (
                <img src={selectedCountry.flag} alt={selectedCountry.name} className="w-5 h-3 sm:w-6 sm:h-4 object-cover mr-2" />
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
                className="flex-1 text-black bg-transparent focus:outline-none"
                style={{ lineHeight: "1.5rem" }}
                required
              />
              <span className="text-red-500 text-xl ml-2">*</span>
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
                    <img src={c.flag} alt={c.name} className="w-5 h-3 sm:w-6 sm:h-4 object-cover" />
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
            className="w-full pb-2 sm:pb-3 border-b border-[#D4E157] text-black focus:outline-none"
            required
          />

          {/* OCCUPATION */}
          <div className="relative w-full">
            <select
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
              className="appearance-none w-full pb-2 sm:pb-3 border-b border-[#D4E157] text-black bg-transparent focus:outline-none cursor-pointer pr-8"
              required
            >
              <option value="" disabled hidden>Select Occupation</option>
              <option>Student</option>
              <option>Working Professional</option>
              <option>Self-Employed / Business</option>
              <option>Homemaker</option>
              <option>Retired</option>
              <option>Currently Not Working</option>
            </select>

            <div className="pointer-events-none absolute right-0 top-1/2 transform -translate-y-1/2 pr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#D4E157]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 sm:py-4 rounded-md font-bold text-lg sm:text-xl text-white
              bg-yellow-500 transition-all duration-300
              ${loading ? "opacity-70 cursor-not-allowed" : "hover:bg-yellow-600 cursor-pointer"}
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <span className="animate-pulse">Processing…</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              "SUBMIT"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}

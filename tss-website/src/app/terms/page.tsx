"use client"

export default function TermsOfServicePage() {
    return (
        <div className="mx-auto max-w-4xl px-6 py-12 text-left leading-relaxed">

            <h1 className="mb-4 text-center text-4xl font-bold text-general">
                Terms of Service - Two Steps Studio
            </h1>

            <p className="mb-10 text-center text-gray-400">
                Last updated: July 23, 2026
            </p>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    1. Introduction
                </h2>

                <p>
                    These Terms of Service ("Terms") govern your use of services
                    provided by Two Steps Studio ("TSS", "we", "us", or "our"),
                    including games, websites, applications, and community platforms.
                </p>

                <p className="mt-3">
                    By accessing or using our services, you agree to these Terms.
                </p>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    2. Use of Our Services
                </h2>

                <p>
                    You may use our services only for lawful purposes.
                </p>

                <p className="mt-3">
                    You agree not to:
                </p>

                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Modify, reverse engineer, or exploit our software without permission</li>
                    <li>Use cheats, hacks, exploits, or unauthorized tools</li>
                    <li>Disrupt our services or communities</li>
                    <li>Impersonate TSS members or representatives</li>
                    <li>Distribute our content without authorization</li>
                </ul>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    3. Games and Software
                </h2>

                <p>
                    Our games and applications are provided "as is".
                </p>

                <p className="mt-3">
                    We may:
                </p>

                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Update or modify features</li>
                    <li>Fix bugs</li>
                    <li>Change or discontinue parts of our services</li>
                </ul>

                <p className="mt-3">
                    We do not guarantee that every service will always be available
                    or error-free.
                </p>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    4. Intellectual Property
                </h2>

                <p>
                    All content created by Two Steps Studio, including but not limited to:
                </p>

                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Games</li>
                    <li>Code</li>
                    <li>Artwork</li>
                    <li>Logos</li>
                    <li>Branding</li>
                    <li>Audio</li>
                    <li>Designs</li>
                </ul>

                <p className="mt-3">
                    is owned by Two Steps Studio or its respective creators unless
                    stated otherwise.
                </p>

                <p className="mt-3">
                    You may not use, copy, sell, or distribute our content without permission.
                </p>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    5. Community Rules
                </h2>

                <p>
                    When participating in TSS communities, including Discord servers,
                    users must:
                </p>

                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Respect other members</li>
                    <li>Follow community guidelines</li>
                    <li>Avoid harassment, spam, or harmful behavior</li>
                    <li>Follow instructions from moderators</li>
                </ul>

                <p className="mt-3">
                    We reserve the right to remove users who violate these rules.
                </p>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    6. User Content
                </h2>

                <p>
                    If you submit feedback, ideas, reports, or other content to TSS,
                    you allow us to use this information to improve our services.
                </p>

                <p className="mt-3">
                    You remain responsible for any content you submit.
                </p>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    7. Third-Party Services
                </h2>

                <p>
                    Our services may include links or integrations with third-party services.
                </p>

                <p className="mt-3">
                    TSS is not responsible for the content, policies, or actions
                    of third-party platforms.
                </p>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    8. Limitation of Liability
                </h2>

                <p>
                    To the maximum extent permitted by law, Two Steps Studio is not
                    responsible for:
                </p>

                <ul className="mt-3 list-disc space-y-2 pl-6">
                    <li>Losses caused by use of our services</li>
                    <li>Data loss</li>
                    <li>Service interruptions</li>
                    <li>Issues caused by third-party services</li>
                </ul>
            </section>


            <section className="mb-8">
                <h2 className="mb-3 text-2xl font-semibold">
                    9. Changes to These Terms
                </h2>

                <p>
                    We may update these Terms at any time.
                </p>

                <p className="mt-3">
                    Continued use of our services after changes means you accept
                    the updated Terms.
                </p>
            </section>


            <section>
                <h2 className="mb-3 text-2xl font-semibold">
                    10. Contact
                </h2>

                <p>
                    If you have questions regarding these Terms, contact Two Steps Studio through:
                </p>

                <p className="mt-3">
                    Website:
                    <br />
                    <a 
                        href="https://two-steps-studio.xyz"
                        className="text-general hover:underline"
                    >
                        https://two-steps-studio.xyz
                    </a>
                </p>

                <p className="mt-5 font-semibold">
                    Two Steps Studio
                </p>
            </section>
        </div>
    )
}
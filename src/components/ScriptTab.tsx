export function ScriptTab() {
  return (
    <div className="mt-4 space-y-6 font-medium text-[#233955]">
      <section className="rounded-xl border border-[#dde5f2] bg-[#f8faff] p-5">
        <h2 className="mb-4 text-lg font-bold text-[#10233f]">
          OUTBOUND CALL SCRIPT
        </h2>
        <p className="mb-1 text-sm text-[#5f7087]">(Cold, aged lead, or partial inquiry)</p>

        <div className="space-y-5 text-[0.95rem] leading-relaxed">
          <div>
            <h3 className="mb-2 font-bold text-[#10233f]">Opening (Intro)</h3>
            <p className="italic">
              &ldquo;Hey [Name], this is Steve from Venture Vault Network.
              We haven&apos;t spoken before — I came across your business while researching companies in your industry, and I just wanted to quickly introduce myself.
            </p>
            <p className="mt-2 italic">
              We&apos;re a small funding network that helps businesses access better financing options — usually faster and more flexible than traditional banks.
            </p>
            <p className="mt-2 italic">
              I&apos;m not sure what your current funding situation looks like, but I wanted to see if it makes sense to have a quick conversation.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-[#10233f]">Reframe (Earn the Right to Continue)</h3>
            <p>
              &ldquo;Fair enough. The reason I&apos;m calling is simple — most merchants talk to one lender and think that&apos;s the market. We put your deal in front of 50+ lenders and let them compete. That&apos;s how better offers show up.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-[#10233f]">Engagement Question (Pull Them In)</h3>
            <p>
              &ldquo;Out of curiosity — if you did take capital, what would you actually use it for right now?&rdquo;
            </p>
            <p className="mt-2 text-sm text-[#5f7087]">(Listen. Repeat back briefly.)</p>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-[#10233f]">Authority + Credibility</h3>
            <p>
              &ldquo;Got it. We&apos;re seeing lenders aggressively fund deals like yours because they want market share. That puts you in control, not the lender.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-[#10233f]">Soft Qualification (No Interrogation)</h3>
            <p>
              &ldquo;Real quick so I know if this makes sense —
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6">
              <li>Monthly revenue roughly over $10K?</li>
              <li>Business operating at least 6 months?</li>
            </ul>
            <p className="mt-2">(If yes → proceed.)</p>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-[#10233f]">Micro-Close</h3>
            <p>
              &ldquo;Perfect. I&apos;m not asking you to take anything today. Let me run your numbers, see what lenders come back with, and then you decide if it&apos;s worth moving forward.&rdquo;
            </p>
          </div>

          <div>
            <h3 className="mb-2 font-bold text-[#10233f]">Action Step</h3>
            <p>
              &ldquo;I&apos;ll text or email you the application — takes about 3 minutes. Once that&apos;s done, I&apos;ll do the heavy lifting. Fair enough?&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#dde5f2] bg-[#f8faff] p-5">
        <h2 className="mb-4 text-lg font-bold text-[#10233f]">
          OBJECTION HANDLERS (USE THESE WORD-FOR-WORD)
        </h2>
        <div className="space-y-4 text-[0.95rem]">
          <div>
            <p className="font-semibold text-[#10233f]">&ldquo;I&apos;m just looking.&rdquo;</p>
            <p className="mt-1">&ldquo;That&apos;s exactly when you should compare offers — before you need it. No obligation.&rdquo;</p>
          </div>
          <div>
            <p className="font-semibold text-[#10233f]">&ldquo;I already have a lender.&rdquo;</p>
            <p className="mt-1">&ldquo;Perfect. Then this is a benchmark. If they&apos;re truly competitive, they&apos;ll win.&rdquo;</p>
          </div>
          <div>
            <p className="font-semibold text-[#10233f]">&ldquo;Not interested.&rdquo;</p>
            <p className="mt-1">&ldquo;No problem — before I let you go, is it timing or pricing that&apos;s the issue?&rdquo;</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border-2 border-[#10233f] bg-[#e2ebfa] p-5">
        <h2 className="mb-2 text-lg font-bold text-[#10233f]">
          FINAL POSITIONING LINE (USE THIS OFTEN)
        </h2>
        <p className="text-[1.05rem] font-semibold italic text-[#10233f]">
          &ldquo;We don&apos;t sell loans — we create leverage for merchants.&rdquo;
        </p>
      </section>
    </div>
  )
}

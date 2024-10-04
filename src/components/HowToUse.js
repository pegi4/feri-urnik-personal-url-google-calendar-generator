export default function HowToUse() {
    return (
      <div className="p-8 font-sans mt-6 max-w-lg mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          How to Use the iCalendar URL Generator
        </h1>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="text-gray-300">
            This tool allows you to generate a customized iCalendar URL based on
            your personal timetable from the Wise Time Table platform. The
            generated URL can then be added to Google Calendar or other calendar
            applications for easy synchronization. You can specify the subjects
            you&apos;re enrolled in and the respective groups for each subject.
          </p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Why?</h2>
          <p className="text-gray-300">
            The Wise Time Table exports the iCalendar files with all subjects by
            default, making it cumbersome to filter out irrelevant subjects. This
            service simplifies the process by allowing you to specify which
            subjects and groups you want to include in the calendar. The result is
            a clean, personalized calendar that reflects only the events relevant
            to you.
          </p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Solution</h2>
          <p className="text-gray-300 mb-2">The Calendar URL Generator lets you:</p>
          <ul className="list-disc list-inside text-gray-300 mb-4">
            <li>
              Input your <strong>Filter ID</strong> (from the Wise Time Table) and
              select the subjects and groups you are part of.
            </li>
            <li>
              Automatically generate a URL that can be added to your Google
              Calendar for automatic syncing.
            </li>
            <li>
              Customize the subjects and group numbers, and receive only the
              events relevant to your schedule.
            </li>
          </ul>
          <p className="text-gray-300">
            Once you have the URL, you can simply copy it and paste it into Google
            Calendar, Thunderbird, or any other calendar application that supports
            iCalendar URLs.
          </p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Usage</h2>
  
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            1. Enter Filter ID:
          </h3>
          <p className="text-gray-300 mb-4">
            Navigate to the Wise Time Table website and generate the filterId by
            selecting your preferred timetable options. The FilterID, which you can get by navigating to the timetable website, selecting the options you want, and then clicking the little book icon at the upper left corner. You will get a permanent link, then you just need to copy the filterId part. For example, in the
            link:{" "}
            <span className="block rounded-md p-2 mt-2">
              https://www.wise-tt.com/wtt_um_feri/index.jsp?filterId=0;37;0;0
            </span>
            The{" "}
            <code className="text-sm bg-gray-300 text-rose-800 px-2 py-1 rounded">
              0;37;0;0
            </code>{" "}
            is the value you need to input in the generator.
          </p>
  
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            2. Add Subjects and Groups:
          </h3>
          <p className="text-gray-300 mb-4">
            Specify the subjects you want to include in your calendar. For each
            subject, you can also specify the group number if applicable. If a
            subject doesn&apos;t have group-specific sessions (e.g., lectures), you can
            leave the group field empty or use &quot;null&quot; as a placeholder.
          </p>
  
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            3. Generate URL:
          </h3>
          <p className="text-gray-300 mb-4">
            Once you&apos;ve entered your subjects and groups, the tool will
            dynamically generate a URL. This URL will point to a filtered version
            of your timetable, including only the relevant subjects and sessions.
          </p>
  
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            4. Copy the URL:
          </h3>
          <p className="text-gray-300 mb-4">
            Use the copy button to easily copy the URL to your clipboard. You can
            then paste this URL into Google Calendar or any other calendar app
            that supports iCal subscriptions.
          </p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">Example URL:</h2>
          <span className="block bg-gray-200 text-rose-800 rounded-md p-2 text-sm">
            http://yourapp.com/api/calendar?filterId=0;37;0;0&subjects=SUBJECT1,1;SUBJECT2,3;SUBJECT3,null
          </span>
        </section>
  
        <section>
          <h2 className="text-2xl font-semibold text-gray-200 mb-4">
            Google Calendar Integration
          </h2>
          <p className="text-gray-300">To integrate with Google Calendar:</p>
          <ul className="list-decimal list-inside text-gray-300 mb-4">
            <li>Open Google Calendar.</li>
            <li>
              On the left-hand side, click the &quot;+&quot; icon next to &quot;Other calendars&quot;
              and select &quot;From URL.&quot;
            </li>
            <li>Paste the URL generated by the tool.</li>
            <li>Click &quot;Add Calendar.&quot;</li>
          </ul>
          <p className="text-gray-300">
            Your calendar will automatically sync with the events filtered based
            on the subjects and groups you&apos;ve selected.
          </p>
        </section>
      </div>
    );
  }

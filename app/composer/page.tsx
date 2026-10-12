import Image from "next/image";

function Composer() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Composer</h1>

      {/* App description */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">About the App</h2>
        <div className="space-y-4 text-lg max-w-3xl">
          <p>
            Do you paint from life and use a viewer to help you compose? Various
            forms of viewers (both portable and stationary) have been used by
            artists for hundreds of years.
          </p>
          <figure className="my-6">
            <a href="/durer-perspective-grid.jpg">
              <Image
                src="/durer-perspective-grid.jpg"
                alt="Historical drawing grid / perspective device"
                width={760}
                height={289}
                className="w-full max-w-2xl h-auto"
              />
            </a>
          </figure>
          <p>
            For most situations I use a very simple viewer which is just two
            right-angled pieces of thin plywood that I fit together to form an
            opening that is the same shape as my canvas. I use some butterfly
            clamps to hold it together and then I look at my motif through it. I
            use charcoal to make marks on the 4 sides of the rectangle such that
            it splits each side into 4 equal divisions. As I look through the
            viewer I have to imagine the grid that connects these hash marks on
            the edge of the viewer's frame. The imagined grid does NOT form
            squares. It creates a grid where each of the 16 rectangular sections
            has the same width/height ratio as the overall canvas. This method
            works for any canvas dimensions; you don't need to worry about the
            canvas dimensions working with a particular size square. I hold it
            up to the motif until I&apos;ve framed in what I want to paint and
            then look at the marks I&apos;ve made on the viewer edges to see
            where the major lines of the composition relate to them. I&apos;ve
            marked off (often by eye, not using a ruler) similar marks on my
            canvas with charcoal or pencil and either draw lines or points where
            all the grid lines intersect. While holding the viewer I&apos;ll
            memorize a few lines and then will transfer that onto the canvas.
            Depending on how complex the arrangement is, I&apos;ll go back and
            forth doing this until I&apos;m fairly certain I&apos;ve gotten the
            basic placement that I want. Its a surprisingly good system
            especially if there are obvious forms like tree trunks, building
            walls or windows, or vertical edge of a still life object that
            relate to the grid&apos;s verticals and, of course, horizons, tree
            lines, table edges, etc will relate to the grid horizontals. I like
            to get less than a dozen main lines that get me started. From there
            I can use measuring techniques to check the placements or just start
            drawing with charcoal and I usually find that I can get the drawing
            correct enough to begin painting. The whole process takes 5 or 10
            minutes once I&apos;ve decided on the composition I want.
          </p>
          <p>
            There are times when I&apos;ve wanted a little more accuracy or some
            way of really seeing what the composition will be in two dimensions.
            For that I decided a phone app that I can use to take a picture of
            my subject along with cropping and gridding will give me a nice
            portable tool that gives me that extra accuracy. Its easy to use to
            get locked in as far as you want to. If there are tough shapes or
            confusing size relationships (e.g. ellipses or complex perspective
            lines) you will find that the grid (perhaps 8x8 if you need extra
            fine accuracy) puts you very close to the mark. Of course, as an
            artist, you want to draw and paint so its up to you how much you
            rely on it. It's got some other features like black and white mode
            and posterizing which can be useful. Try it out and see! It's free!
            If you really like it and want to help me cover the cost of keeping
            it online in the Apple Store, you can make a donation below.
            Suggestions welcome.
          </p>
        </div>
      </section>

      {/* Download */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Download</h2>
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="inline-block px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {/* TODO: Link to the app download. */}
            Download the App
          </a>
          <span className="text-lg font-medium text-gray-600">Coming Soon</span>
        </div>
      </section>

      {/* Donate */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Support</h2>
        <a
          href="#"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {/* TODO: Link to the donation page. */}
          Donate
        </a>
      </section>

      {/* YouTube video */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Watch</h2>
        <div className="relative w-full max-w-2xl aspect-video bg-gray-200">
          <iframe
            className="absolute inset-0 w-full h-full"
            /* TODO: Replace with your YouTube embed URL. */
            src=""
            title="David Marshall describing the app"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </section>
    </div>
  );
}
export default Composer;

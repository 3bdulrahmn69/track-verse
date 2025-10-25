import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MdRocketLaunch } from 'react-icons/md';

export default function CTA() {
  return (
    <section className="py-20 px-4 bg-linear-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Media Experience?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of users who have already discovered the power of
            organized media tracking. Your favorite stories deserve to be
            perfectly organized.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <MdRocketLaunch className="w-5 h-5 mr-2" />
              Start Tracking Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

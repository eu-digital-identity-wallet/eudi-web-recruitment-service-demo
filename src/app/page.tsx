/**
 * Page: / (Root/Home Page)
 *
 * Accessed by: Direct navigation to the application root URL
 * When: User visits the application home page
 *
 * Purpose: Redirects to the vacancies listing page (acts as entry point to the recruitment system)
 *
 * Note: This is a simple re-export that makes /vacancies/page the default home page
 */
export const dynamic = 'force-dynamic';

export { default } from './vacancies/page';

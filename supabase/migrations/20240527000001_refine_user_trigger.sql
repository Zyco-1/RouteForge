-- Refine the handle_new_user function to handle metadata safely
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_github_id BIGINT;
    v_github_username TEXT;
BEGIN
    -- Extract GitHub ID safely, handle both string and numeric formats
    v_github_id := (NEW.raw_user_meta_data->>'sub')::BIGINT;
    v_github_username := COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'full_name', 'User');

    INSERT INTO public.profiles (id, email, github_id, github_username)
    VALUES (
        NEW.id,
        NEW.email,
        v_github_id,
        v_github_username
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        github_id = EXCLUDED.github_id,
        github_username = EXCLUDED.github_username,
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Fallback to basic profile if metadata is messy
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

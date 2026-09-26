import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const createUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      nom_complet,
      telephone,
      fonction,
      module,
      is_admin,
    } = req.body;

    if (!email || !password || !nom_complet) {
      return res.status(400).json({
        success: false,
        message: "Email, mot de passe et nom complet sont obligatoires.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Le mot de passe doit contenir au moins 6 caractères.",
      });
    }

    // Vérifier si l'email existe déjà
    const { data: usersData, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      throw new Error(usersError.message);
    }

    const existingUser = usersData.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Un utilisateur avec cet email existe déjà.",
      });
    }

    // Créer le compte Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      throw new Error(
        authError?.message || "Impossible de créer le compte."
      );
    }

    const userId = authData.user.id;

    // Créer le profil
    const { error: profilError } = await supabase
      .from("profils")
      .insert({
        id: userId,
        nom_complet: nom_complet.trim(),
        telephone: telephone?.trim() || null,
        fonction: fonction?.trim() || null,
        module: module?.trim() || null,
      });

    if (profilError) {
      // Nettoyage du compte Auth si le profil échoue
      await supabase.auth.admin.deleteUser(userId);
      throw new Error(profilError.message);
    }

    // Si demandé, ajouter comme administrateur
    if (is_admin === true) {
      const { error: adminError } = await supabase
        .from("equipe_admins")
        .insert({
          user_id: userId,
        });

      if (adminError) {
        // Nettoyage complet
        await supabase.from("profils").delete().eq("id", userId);
        await supabase.auth.admin.deleteUser(userId);

        throw new Error(adminError.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: is_admin
        ? "Utilisateur créé et administrateur ajouté."
        : "Utilisateur créé avec succès.",
      data: {
        id: userId,
        email: authData.user.email,
        nom_complet,
        telephone: telephone || null,
        fonction: fonction || null,
        module: module || null,
        is_admin: is_admin === true,
      },
    });
  } catch (error) {
    console.error("Erreur création utilisateur :", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la création de l'utilisateur.",
    });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = String(req.params.id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "ID utilisateur manquant.",
      });
    }

    const { error: profileError } = await supabase
      .from("profils")
      .delete()
      .eq("id", userId);

    if (profileError) {
      throw new Error(profileError.message);
    }

    const { error: adminError } = await supabase
      .from("equipe_admins")
      .delete()
      .eq("user_id", userId);

    if (adminError) {
      console.error("Erreur suppression admin :", adminError.message);
    }

    const { error: authError } =
      await supabase.auth.admin.deleteUser(userId);

    if (authError) {
      throw new Error(authError.message);
    }

    return res.json({
      success: true,
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (error) {
    console.error("Erreur suppression utilisateur :", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression.",
    });
  }
};
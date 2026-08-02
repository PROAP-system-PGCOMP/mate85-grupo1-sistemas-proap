package br.ufba.proap.authentication.domain;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "aut_perfil", schema = "proap")
public class Perfil implements Serializable {

	private static final long serialVersionUID = 6718249363254821367L;
	private static final String DEFAULT_PERFIL_NAME = "Discente";

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "perfil_seq")
    @SequenceGenerator(
            name = "perfil_seq",
            sequenceName = "aut_perfil_id_seq", // O nome da sequence real no seu Postgres
            allocationSize = 1
    )
    private Long id;

	@Column(nullable = false, unique = true)
	private String name;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(name = "aut_perfil_permission", schema = "proap", joinColumns = @JoinColumn(name = "perfil_id"), inverseJoinColumns = @JoinColumn(name = "permission_id"))
	private Set<Permission> permissions;

	@JsonManagedReference
	@OneToMany(fetch = FetchType.LAZY, mappedBy = "perfil")
	private List<User> users;

	public boolean hasPermission(String key) {
		return permissions.stream().filter(Permission::isEnabled).anyMatch(p -> p.getKey().equalsIgnoreCase(key));
	}

	public static String getDefaultPerfilName() {
		return DEFAULT_PERFIL_NAME;
	}
}